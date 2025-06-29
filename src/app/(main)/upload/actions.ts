
'use server'

import { z } from "zod"
import { type RepoFile } from "@/lib/types"

const CreateRepoInputSchema = z.object({
  token: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isPrivate: z.boolean(),
  files: z.array(z.object({
      path: z.string(),
      content: z.string(),
      mode: z.string(),
      encoding: z.enum(['utf-8', 'base64']).optional(),
  })),
})

export async function createRepoAndPush(
    input: z.infer<typeof CreateRepoInputSchema>
): Promise<{ success: boolean; error?: string; url?: string }> {
    const { token, name, description, isPrivate, files } = input;
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
    };

    try {
        // 1. Create the repository
        const createRepoRes = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name,
                description,
                private: isPrivate,
                auto_init: false, // Don't auto-initialize
            }),
        });

        if (!createRepoRes.ok) {
            const error = await createRepoRes.json().catch(() => ({ message: 'Could not parse error response from GitHub.' }));
            const details = error.errors ? JSON.stringify(error.errors) : error.message;
            return { success: false, error: `Failed to create repo: ${details || 'Check if a repo with this name already exists.'}` };
        }
        const repoData = await createRepoRes.json();
        const owner = repoData.owner.login;
        // For empty repos, default_branch is null. We must define it.
        const defaultBranch = 'main';

        // 2. Create blobs for all files
        const blobPromises = files.map(file => 
            fetch(`https://api.github.com/repos/${owner}/${name}/git/blobs`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ content: file.content, encoding: file.encoding ?? 'utf-8' }),
            }).then(async res => ({ ok: res.ok, data: await res.json(), path: file.path }))
        );
        const blobResponses = await Promise.all(blobPromises);
        
        const blobs = blobResponses.map((res) => {
            if (!res.ok || !res.data.sha) {
                throw new Error(`Failed to create blob for file: ${res.path}. GitHub said: ${res.data.message || 'Unknown error'}`);
            }
            return res.data;
        });

        // 3. Create the tree
        const tree = blobs.map((blob, index) => ({
            path: files[index].path,
            mode: files[index].mode,
            type: 'blob',
            sha: blob.sha,
        }));
        
        const createTreeRes = await fetch(`https://api.github.com/repos/${owner}/${name}/git/trees`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ tree }),
        });
        if (!createTreeRes.ok) {
             const errorBody = await createTreeRes.json().catch(() => ({}));
             console.error("GitHub API Error (create-tree):", errorBody);
             throw new Error(`Failed to create Git tree. GitHub said: ${errorBody.message || createTreeRes.statusText}`);
        }
        const treeData = await createTreeRes.json();

        // 4. Create the initial commit
        const createCommitRes = await fetch(`https://api.github.com/repos/${owner}/${name}/git/commits`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                message: 'Initial commit from GitOrbit',
                tree: treeData.sha,
                parents: [], // No parents for the initial commit
            }),
        });
        if (!createCommitRes.ok) {
            const errorBody = await createCommitRes.json().catch(() => ({}));
            console.error("GitHub API Error (create-commit):", errorBody);
            throw new Error(`Failed to create initial commit. GitHub said: ${errorBody.message || createCommitRes.statusText}`);
        }
        const commitData = await createCommitRes.json();

        // 5. Update the branch reference to point to the new commit
        const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${name}/git/refs`, {
            method: 'POST', // Use POST to create the ref for the first time
            headers,
            body: JSON.stringify({
                ref: `refs/heads/${defaultBranch}`,
                sha: commitData.sha,
            }),
        });
        
        if (!updateRefRes.ok) {
            // If it failed because it exists, try to PATCH it
            const patchRefRes = await fetch(`https://api.github.com/repos/${owner}/${name}/git/refs/heads/${defaultBranch}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ sha: commitData.sha }),
            });
            if (!patchRefRes.ok) {
                 const errorBody = await patchRefRes.json().catch(() => ({}));
                 console.error("GitHub API Error (update-ref):", errorBody);
                 throw new Error(`Failed to update branch reference. GitHub said: ${errorBody.message || patchRefRes.statusText}`);
            }
        }

        return { success: true, url: repoData.html_url };

    } catch (err: any) {
        console.error("GitHub push error:", err);
        return { success: false, error: err.message || "An unknown error occurred during the push to GitHub." };
    }
}
