
'use server';

import { z } from 'zod';
import { type GitHubCollaborator } from '@/lib/types';

const MANAGE_COLLABORATORS_ERROR = "Failed to manage collaborators. You must have admin rights to the repository.";

const ManageCollaboratorsInput = z.object({
  owner: z.string(),
  repo: z.string(),
  token: z.string(),
});

export async function getCollaborators(
  input: z.infer<typeof ManageCollaboratorsInput>
): Promise<{ data?: GitHubCollaborator[]; error?: string }> {
  const { owner, repo, token } = input;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/collaborators`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    if (!response.ok) {
      if (response.status === 403 || response.status === 404) {
          return { error: "Could not fetch collaborators. You might not have the necessary permissions, or the repository may be private." };
      }
      throw new Error(`GitHub API responded with ${response.status}`);
    }
    const data: GitHubCollaborator[] = await response.json();
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

const AddCollaboratorInput = ManageCollaboratorsInput.extend({
  username: z.string(),
});

export async function addCollaborator(
  input: z.infer<typeof AddCollaboratorInput>
): Promise<{ success: boolean; error?: string }> {
    const { owner, repo, token, username } = input;
    try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/collaborators/${username}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
        // GitHub sends 201 for new invite, 204 for existing collaborator
        if (response.status === 201 || response.status === 204) {
            return { success: true };
        }
        if (response.status === 403) {
            return { success: false, error: MANAGE_COLLABORATORS_ERROR };
        }
        return { success: false, error: `GitHub API responded with ${response.status}` };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

const RemoveCollaboratorInput = ManageCollaboratorsInput.extend({
  username: z.string(),
});

export async function removeCollaborator(
  input: z.infer<typeof RemoveCollaboratorInput>
): Promise<{ success: boolean; error?: string }> {
    const { owner, repo, token, username } = input;
    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/collaborators/${username}`,
            {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/vnd.github.v3+json',
                },
            }
        );
         if (response.status === 204) {
            return { success: true };
        }
        if (response.status === 403) {
             return { success: false, error: MANAGE_COLLABORATORS_ERROR };
        }
        return { success: false, error: `GitHub API responded with ${response.status}` };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
