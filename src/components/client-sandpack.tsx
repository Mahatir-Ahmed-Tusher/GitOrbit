
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
    SandpackProvider,
    SandpackPreview,
    SandpackFileExplorer,
    SandpackCodeEditor,
    useSandpack,
} from "@codesandbox/sandpack-react"
import { useTheme } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { editCode } from "@/ai/flows/edit-code"
import { explainCode } from "@/ai/flows/explain-code"
import { Loader2, Code, Eye, Download, Send, Sparkles, GitBranch, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import JSZip from "jszip"
import { AnimatePresence, motion } from "framer-motion"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { type LoadedRepoInfo, type RepoFile, type LocalProject } from "@/lib/types"

const AiInteractionDialog = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { sandpack } = useSandpack()
    const { files, activeFile, updateFile } = sandpack

    const [isProcessing, setIsProcessing] = useState(false)
    const [aiPrompt, setAiPrompt] = useState("")
    const [aiAction, setAiAction] = useState<'edit' | 'explain'>('edit')
    const [explanationContent, setExplanationContent] = useState("")
    const [isExplainModalOpen, setIsExplainModalOpen] = useState(false)
    const { toast } = useToast()

    const handleAiAction = async () => {
        const currentCode = files[activeFile]?.code
        if (!currentCode || !aiPrompt.trim()) return

        setIsProcessing(true)
        onOpenChange(false)

        try {
            if (aiAction === 'explain') {
                const result = await explainCode({ code: currentCode, prompt: aiPrompt })
                setExplanationContent(result)
                setIsExplainModalOpen(true)
                toast({ title: "AI Explain Succeeded" })
            } else {
                toast({ title: "AI Edit in Progress...", description: "The AI is modifying the code." })
                const result = await editCode({ code: currentCode, prompt: aiPrompt })
                updateFile(activeFile, result.editedCode)
                toast({ title: "AI Edit Succeeded", description: "The code has been updated in the editor." })
            }
        } catch (error) {
            console.error("AI action failed:", error)
            toast({ title: `AI ${aiAction === 'edit' ? 'Edit' : 'Explain'} Failed`, variant: "destructive" })
        } finally {
            setIsProcessing(false)
            setAiPrompt("")
        }
    }

    useEffect(() => {
        if (!isOpen) {
            setAiPrompt("")
        }
    }, [isOpen])

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Sparkles /> AI Assistant</DialogTitle>
                        <DialogDescription>
                            Ask AI to edit or explain the code in <span className="font-mono text-xs bg-muted p-1 rounded">{activeFile.split('/').pop()}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                         <Textarea
                            placeholder={`e.g., "Refactor this to use a switch statement" or "What does this regex do?"`}
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="resize-none h-24"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleAiAction();
                                }
                            }}
                        />
                        <RadioGroup defaultValue={aiAction} onValueChange={(value) => setAiAction(value as 'edit' | 'explain')} className="flex items-center gap-4">
                             <div className="flex items-center space-x-2"><RadioGroupItem value="edit" id="r-edit" /><Label htmlFor="r-edit">Edit Code</Label></div>
                             <div className="flex items-center space-x-2"><RadioGroupItem value="explain" id="r-explain" /><Label htmlFor="r-explain">Explain Code</Label></div>
                        </RadioGroup>
                    </div>
                    <DialogFooter>
                         <Button onClick={handleAiAction} disabled={isProcessing || !aiPrompt.trim()}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : <Send />}
                            Submit (Ctrl+Enter)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isExplainModalOpen} onOpenChange={setIsExplainModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>AI Code Explanation</DialogTitle>
                        <DialogDescription>AI-generated explanation for <span className="font-mono text-xs bg-muted p-1 rounded">{activeFile.split('/').pop()}</span>.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto rounded-md border bg-muted p-4">
                        <article className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-code text-foreground">{explanationContent}</article>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

const AiShortcutHint = () => {
  const [show, setShow] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setShow(true);
    timerRef.current = setTimeout(() => {
        setShow(false);
    }, 4000);

    return () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
    }
  }, []);

  return (
    <AnimatePresence>
    {show && (
       <motion.div
            className="pointer-events-none absolute bottom-4 right-4 z-50 rounded-md bg-background/80 px-3 py-1.5 text-sm text-foreground shadow-lg backdrop-blur-sm ring-1 ring-black/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
        >
      Press{' '}
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        Ctrl
      </kbd>{' '}
      +{' '}
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        I
      </kbd>{' '}
      to ask AI for help.
    </motion.div>
    )}
    </AnimatePresence>
  );
};

const VscodeIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.15 2.587L18.437.225a1.859 1.859 0 00-1.837.212L10.35 5.584v12.832l6.25-4.135 6.55 4.135V4.424c0-.75-.487-1.39-1.2-1.837z" />
        <path d="M.85 21.413L5.563 23.775c.712.337 1.587.1 1.837-.212L13.65 18.416V5.584L7.4 9.719.85 13.853v7.56z" />
    </svg>
)

const SandpackInternal = ({ repoName, repoFiles, isLocalMode }: { repoName: string; repoFiles: RepoFile[], isLocalMode: boolean }) => {
    const { sandpack } = useSandpack()
    const { files, activeFile } = sandpack
    const { toast } = useToast()
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('code')
    const [isAiModalOpen, setIsAiModalOpen] = useState(false)
    const [showAiHint, setShowAiHint] = useState(false);
    
    const [loadedRepo] = useLocalStorage<LoadedRepoInfo | null>("gitorbit_loaded_repo", null)
    const [localProject, setLocalProject] = useLocalStorage<LocalProject | null>('gitorbit_local_project', null)
    const [githubPat] = useLocalStorage("gitorbit_github_pat", "")
    const initialFilesRef = useRef(files)
    const [modifiedFiles, setModifiedFiles] = useState<Set<string>>(new Set())

    const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false)
    const [commitMessage, setCommitMessage] = useState("")
    const [isCommitting, setIsCommitting] = useState(false)
    
    const [isVscodeDialogOpen, setIsVscodeDialogOpen] = useState(false)

    const fileModes = useMemo(() => {
        if (!repoFiles) return new Map();
        return new Map(repoFiles.map(f => [ `/${f.path}`, f.mode ]));
    }, [repoFiles]);
    
    useEffect(() => {
        const initialCode = initialFilesRef.current;
        const currentCode = files;
        const changed = new Set<string>();

        Object.keys(currentCode).forEach(path => {
            if (initialCode[path] && initialCode[path].code !== currentCode[path].code) {
                changed.add(path);
            }
        });
        setModifiedFiles(changed);
    }, [files]);
    
    useEffect(() => {
        setShowAiHint(true);
    }, [activeFile]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault()
                setIsAiModalOpen(prev => !prev)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const handleDownloadZip = () => {
        const zip = new JSZip()
        Object.entries(files).forEach(([path, file]) => {
            const filePath = path.startsWith("/") ? path.substring(1) : path
            if (!file.hidden && filePath) {
                 zip.file(filePath, (file as { code: string }).code)
            }
        })
        zip.generateAsync({ type: "blob" }).then((content) => {
            const url = URL.createObjectURL(content)
            const a = document.createElement("a");
            a.href = url;
            a.download = `${repoName}.zip`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url)
            toast({ title: "Success", description: "Project files downloaded." })
        })
    }
    
    const handleOpenInVsCode = () => {
        handleDownloadZip();
        setIsVscodeDialogOpen(true);
    };

    const handleSaveLocal = () => {
        if (!isLocalMode || !localProject) return
        
        const updatedFiles: RepoFile[] = Object.entries(files).map(([path, file]) => ({
            path: path.substring(1), // remove leading slash
            content: (file as {code: string}).code,
            mode: fileModes.get(path) || "100644"
        }))

        const updatedProject: LocalProject = { ...localProject, files: updatedFiles }
        setLocalProject(updatedProject)
        toast({ title: "Project Saved", description: "Your changes have been saved to local storage." })
        initialFilesRef.current = files // Update base for future changes
        setModifiedFiles(new Set())
    }

    const handleCommit = async () => {
        if (!loadedRepo || !githubPat) {
            toast({
                title: "Authentication Required",
                description: "Please add a GitHub Personal Access Token in Settings to commit changes.",
                variant: "destructive",
            });
            return;
        }

        if (modifiedFiles.size === 0 || !commitMessage.trim()) {
            toast({ title: "Nothing to commit", description: "No files have been changed or commit message is empty.", variant: "destructive" });
            return;
        }

        setIsCommitting(true);
        toast({ title: "Committing changes...", description: "Please wait while we push your changes to GitHub." });

        const { owner, repo, defaultBranch } = loadedRepo;
        const headers = {
            'Authorization': `Bearer ${githubPat}`,
            'Accept': 'application/vnd.github.v3+json',
        };

        try {
            // 1. Get the latest commit SHA of the branch
            const refResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, { headers });
            if (!refResponse.ok) throw new Error("Failed to get branch reference.");
            const refData = await refResponse.json();
            const latestCommitSha = refData.object.sha;

            // 2. Get the tree SHA of the latest commit
            const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
            if (!commitResponse.ok) throw new Error("Failed to get latest commit data.");
            const commitData = await commitResponse.json();
            const baseTreeSha = commitData.tree.sha;

            // 3. Create blobs for each modified file
            const changedFiles = Array.from(modifiedFiles);
            const createBlobPromises = changedFiles.map(path => {
                const content = files[path].code;
                return fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ content, encoding: 'utf-8' }),
                }).then(res => res.json());
            });

            const blobResults = await Promise.all(createBlobPromises);

            // 4. Create a new tree with the new blobs
            const tree = blobResults.map((blob, index) => {
                const path = changedFiles[index];
                const mode = fileModes.get(path) || '100644';
                return {
                    path: path.substring(1), // remove leading slash
                    mode,
                    type: 'blob',
                    sha: blob.sha,
                }
            });

            const createTreeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ base_tree: baseTreeSha, tree }),
            });
             if (!createTreeResponse.ok) {
                 const errorBody = await createTreeResponse.json().catch(() => ({}));
                 console.error("GitHub API Error (create-tree):", errorBody);
                 throw new Error(`Failed to create new tree. GitHub said: ${errorBody.message || createTreeResponse.statusText}`);
            }
            const newTree = await createTreeResponse.json();

            // 5. Create a new commit
            const newCommitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: commitMessage,
                    tree: newTree.sha,
                    parents: [latestCommitSha],
                }),
            });
             if (!newCommitResponse.ok) {
                const errorBody = await newCommitResponse.json().catch(() => ({}));
                console.error("GitHub API Error (create-commit):", errorBody);
                throw new Error(`Failed to create new commit. GitHub said: ${errorBody.message || newCommitResponse.statusText}`);
            }
            const newCommit = await newCommitResponse.json();

            // 6. Update the branch reference
            const updateRefResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ sha: newCommit.sha }),
            });
            if (!updateRefResponse.ok) {
                const errorBody = await updateRefResponse.json().catch(() => ({}));
                console.error("GitHub API Error (update-ref):", errorBody);
                throw new Error(`Failed to update branch reference. The remote may have new changes. GitHub said: ${errorBody.message || updateRefResponse.statusText}`);
            }

            toast({ title: "Commit Successful!", description: "Your changes have been pushed to GitHub." });
            initialFilesRef.current = files; // Update base for future changes
            setModifiedFiles(new Set());
            setCommitMessage("");
            setIsCommitDialogOpen(false);

        } catch (error: any) {
            console.error("Commit failed:", error);
            toast({ title: "Commit Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
        } finally {
            setIsCommitting(false);
        }
    };
    
    return (
        <div className="grid h-full w-full grid-cols-[250px_1fr] grid-rows-[auto_1fr] bg-background">
            <header className="col-span-2 flex h-14 flex-shrink-0 items-center justify-between gap-4 border-b px-3">
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleOpenInVsCode}>
                        <VscodeIcon />
                        Open in VS Code
                    </Button>
                    {isLocalMode ? (
                        <Button variant="outline" size="sm" onClick={handleSaveLocal} disabled={modifiedFiles.size === 0}>
                            <Save className="mr-2" />
                            Save ({modifiedFiles.size})
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setIsCommitDialogOpen(true)} disabled={modifiedFiles.size === 0}>
                            <GitBranch className="mr-2" />
                            Commit ({modifiedFiles.size})
                        </Button>
                    )}
                    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                        <Button variant={viewMode === 'code' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('code')} className="h-8 px-3">
                            <Code className="mr-2" /> Code
                        </Button>
                        <Button variant={viewMode === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('preview')} className="h-8 px-3">
                            <Eye className="mr-2" /> Preview
                        </Button>
                    </div>
                 </div>
                 <p className="text-sm text-muted-foreground hidden lg:block">Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Ctrl</kbd> + <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">I</kbd> to open AI Assistant.</p>
            </header>
            
            <div className="h-full min-h-0 border-r bg-background overflow-y-auto">
                <SandpackFileExplorer />
            </div>

            <main className="relative flex h-full flex-col min-h-0">
                <div className="flex-1 min-h-0">
                     {viewMode === 'code' ? (
                        <SandpackCodeEditor
                           showLineNumbers
                           showTabs
                           style={{ height: '100%' }}
                        />
                    ) : (
                        <SandpackPreview style={{ height: '100%', width: '100%' }} showOpenInCodeSandbox={false} showRefreshButton={true} />
                    )}
                </div>
                {showAiHint && <AiShortcutHint key={activeFile} />}
            </main>
            <AiInteractionDialog isOpen={isAiModalOpen} onOpenChange={setIsAiModalOpen} />
            
            <Dialog open={isCommitDialogOpen} onOpenChange={setIsCommitDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Commit Changes</DialogTitle>
                        <DialogDescription>
                            Enter a commit message for the {modifiedFiles.size} changed file(s).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="e.g., Fix bug in login component"
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            className="h-24"
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCommit} disabled={isCommitting || !commitMessage.trim()}>
                            {isCommitting ? <Loader2 className="animate-spin" /> : <GitBranch />}
                            Commit & Push
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isVscodeDialogOpen} onOpenChange={setIsVscodeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Open in VS Code</DialogTitle>
                        <DialogDescription>
                            Your project has been downloaded as a ZIP file.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Find the downloaded <strong>{repoName}.zip</strong> file in your downloads folder.</li>
                            <li><strong>Unzip</strong> the file to create a new project folder.</li>
                            <li>In VS Code, go to <strong>File &gt; Open Folder...</strong> and select the unzipped folder.</li>
                        </ol>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsVscodeDialogOpen(false)}>Got it</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export function ClientSandpack({ files, repoName, repoFiles, isLocalMode }: { files: Record<string, { code: string }>, repoName: string, repoFiles: RepoFile[], isLocalMode: boolean }) {
    const { theme } = useTheme()
    
    const [initialActiveFile, setInitialActiveFile] = useState<string | undefined>(undefined);
    const [sandpackKey, setSandpackKey] = useState(0)

    useEffect(() => {
        if (Object.keys(files).length > 0) {
            const fileKeys = Object.keys(files)
            const entryPoints = ["/src/app/page.tsx", "/src/pages/index.tsx", "/index.js", "/src/App.tsx", "/App.js", "/index.html", "/page.tsx"];
            const entry = entryPoints.find(f => fileKeys.includes(f)) || fileKeys[0]
            setInitialActiveFile(entry);
            setSandpackKey(prev => prev + 1);
        }
    }, [files]);
    
    if (!initialActiveFile) {
        return (
             <div className="flex h-full flex-col items-center justify-center text-center p-4">
                <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
                <h2 className="text-2xl font-semibold">Preparing Sandbox...</h2>
            </div>
        )
    }

    return (
        <SandpackProvider
            key={sandpackKey}
            files={files}
            template="nextjs"
            theme={theme === "dark" ? "dark" : "light"}
            options={{
                activeFile: initialActiveFile,
                editorHeight: '100%',
            }}
        >
            <SandpackInternal repoName={repoName} repoFiles={repoFiles} isLocalMode={isLocalMode} />
        </SandpackProvider>
    )
}
