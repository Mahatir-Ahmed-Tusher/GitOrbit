
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { type RepoFile, type LoadedRepoInfo, type LocalProject } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Loader2, GitCommit, CodeXml } from "lucide-react"

const ClientSandpack = dynamic(
    () => import("@/components/client-sandpack").then(mod => mod.ClientSandpack),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full flex-col items-center justify-center text-center p-4">
                <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
                <h2 className="text-2xl font-semibold">Loading Editor...</h2>
            </div>
        )
    }
)

const formatFilesForSandpack = (files: RepoFile[]) => {
  if (!files || files.length === 0) return {}
  return files.reduce((acc, file) => {
    const pathWithSlash = file.path.startsWith("/") ? file.path : `/${file.path}`
    acc[pathWithSlash] = { code: file.content }
    return acc
  }, {} as Record<string, { code: string }>)
}

export default function EditorPage() {
    const [loadedRepo] = useLocalStorage<LoadedRepoInfo | null>("gitorbit_loaded_repo", null)
    const [repoFiles] = useLocalStorage<RepoFile[]>("gitorbit_repo_files", [])
    const [localProject] = useLocalStorage<LocalProject | null>('gitorbit_local_project', null)

    const isGitHubMode = !!loadedRepo
    const isLocalMode = !!localProject && !loadedRepo

    const files = isLocalMode ? localProject.files : repoFiles
    const projectName = isLocalMode ? localProject.name : (isGitHubMode ? loadedRepo.repo : "Editor")

    if (!isGitHubMode && !isLocalMode) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-center p-4">
                <CodeXml className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">Code Editor</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                    To start editing, load a repository from the{" "}
                    <Button variant="link" asChild className="p-0 h-auto align-baseline text-base">
                        <Link href="/home">Home page</Link>
                    </Button>
                    {" "}or create a new project on the{" "}
                     <Button variant="link" asChild className="p-0 h-auto align-baseline text-base">
                        <Link href="/upload">Upload page</Link>
                    </Button>
                    .
                </p>
            </div>
        )
    }

    if (files.length === 0) {
        return (
             <div className="flex h-full flex-col items-center justify-center text-center p-4">
                <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
                <h2 className="text-2xl font-semibold">Loading Files...</h2>
            </div>
        )
    }

    const sandpackFiles = formatFilesForSandpack(files)

    return (
        <div className="h-full">
            <ClientSandpack 
              key={localProject?.name || loadedRepo?.url} // Force re-render when project changes
              files={sandpackFiles}
              repoName={projectName}
              repoFiles={files}
              isLocalMode={isLocalMode}
            />
        </div>
    );
}
