
"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { type LocalProject, type RepoFile, type LoadedRepoInfo } from "@/lib/types"
import { createRepoAndPush } from "./actions"
import { generateProject } from "@/ai/flows/generate-project"
import { isBinary } from "@/lib/utils"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, UploadCloud, Folder, File, Trash2, Github, CodeXml, PlusSquare, AlertCircle, Sparkles } from "lucide-react"

// A component for the AI Project Generator
const AiProjectGenerator = ({ onProjectCreate }: { onProjectCreate: (project: LocalProject) => void }) => {
    const [prompt, setPrompt] = useState("")
    const [projectName, setProjectName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleGenerateProject = async () => {
        if (!prompt.trim() || !projectName.trim()) {
            toast({ title: "Error", description: "Project name and prompt are required.", variant: "destructive" })
            return
        }
        setIsLoading(true)
        toast({ title: "AI is Building Your Project...", description: "This may take a minute or two. Please be patient." })

        try {
            const result = await generateProject({ prompt })
            
            if (!result || !result.files || result.files.length === 0) {
                 throw new Error("AI returned an empty project. Please try a different prompt.")
            }

            const repoFiles: RepoFile[] = result.files.map(file => ({
                path: file.path,
                content: file.content,
                mode: '100644', // default file mode
                encoding: 'utf-8',
            }));

            onProjectCreate({
                name: projectName,
                files: repoFiles,
                createdAt: Date.now()
            })

        } catch (error: any) {
            console.error("AI Project Generation Failed:", error)
            toast({ title: "Generation Failed", description: error.message || "An unknown error occurred.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles /> Build with AI</CardTitle>
                <CardDescription>Describe the application you want to build, and AI will generate the entire codebase for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="ai-project-name">Project Name</Label>
                    <Input 
                        id="ai-project-name"
                        placeholder="my-ai-portfolio"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ai-prompt">Your Prompt</Label>
                    <Textarea
                        id="ai-prompt"
                        placeholder="e.g., A modern portfolio website for a photographer with a home page, about page, and a gallery page to showcase work."
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        disabled={isLoading}
                        className="h-32"
                    />
                </div>
            </CardContent>
             <CardFooter>
                <Button onClick={handleGenerateProject} disabled={isLoading || !prompt || !projectName} className="w-full">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Generate Project"}
                </Button>
            </CardFooter>
        </Card>
    )
}

// A component for the uploader UI
const ProjectUploader = ({ onProjectCreate }: { onProjectCreate: (project: LocalProject) => void }) => {
  const [projectName, setProjectName] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      if (!projectName && e.target.files.length > 0) {
        const firstFile = e.target.files[0]
        const pathParts = (firstFile.webkitRelativePath || firstFile.name).split('/')
        if (pathParts.length > 1) {
          setProjectName(pathParts[0])
        }
      }
    }
  }

  const handleCreateProject = async () => {
    if (!projectName.trim() || files.length === 0) return
    setIsLoading(true)
    
    const repoFiles: RepoFile[] = await Promise.all(
      files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader()
        const path = file.webkitRelativePath || file.name

        if (isBinary(path)) {
            reader.onload = () => {
                const result = reader.result as string
                const content = result.split(',')[1]
                resolve({ path, content, mode: '100644', encoding: 'base64' })
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        } else {
            reader.onload = () => resolve({
              path,
              content: reader.result as string,
              mode: '100644',
              encoding: 'utf-8'
            })
            reader.onerror = reject
            reader.readAsText(file)
        }
      }))
    )

    onProjectCreate({
      name: projectName,
      files: repoFiles,
      createdAt: Date.now()
    })
    
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UploadCloud /> Upload Project Folder</CardTitle>
        <CardDescription>Upload a project from your computer to start editing in GitOrbit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input 
                id="project-name"
                placeholder="my-awesome-project"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
            />
        </div>
        <div className="space-y-2">
            <Label>Project Folder</Label>
            <div 
                className="flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                onClick={() => inputRef.current?.click()}
            >
                <div className="text-center">
                    <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        {files.length > 0 ? `${files.length} files selected` : "Click to select a folder"}
                    </p>
                </div>
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    // @ts-ignore
                    webkitdirectory="true"
                    directory="true"
                />
            </div>
        </div>
      </CardContent>
      <CardFooter>
          <Button onClick={handleCreateProject} disabled={isLoading || !projectName || files.length === 0} className="w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : "Create & Load Project"}
          </Button>
      </CardFooter>
    </Card>
  )
}

// Main page component
export default function UploadPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { user, githubToken } = useAuth()
    const [githubPat] = useLocalStorage("gitorbit_github_pat", "")
    const [localProject, setLocalProject] = useLocalStorage<LocalProject | null>('gitorbit_local_project', null)
    const [, setLoadedRepo] = useLocalStorage<LoadedRepoInfo | null>('gitorbit_loaded_repo', null)

    const [isCreatingRepo, setIsCreatingRepo] = useState(false)
    const [newRepoName, setNewRepoName] = useState(localProject?.name || "")
    const [newRepoDescription, setNewRepoDescription] = useState("")
    const [isPrivate, setIsPrivate] = useState(true)

    const effectiveToken = githubToken || githubPat

    const onProjectCreate = (project: LocalProject) => {
        try {
            setLoadedRepo(null)
            setLocalProject(project)
            setNewRepoName(project.name)
            toast({ title: "Project Loaded!", description: `${project.name} is ready to be edited.` })
            router.push('/editor')
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                toast({
                  title: "Storage Limit Exceeded",
                  description: "This project is too large to store in your browser. Please try a smaller one.",
                  variant: "destructive",
                });
            } else {
                 toast({ title: "Error", description: "Could not save the project locally.", variant: "destructive" });
            }
            console.error(error);
        }
    }
    
    const handleCreateRepo = async () => {
        if (!localProject || !effectiveToken || !user) {
            toast({ title: "Error", description: "No local project loaded, you're not signed in, or a GitHub token is missing.", variant: "destructive" })
            return
        }
        setIsCreatingRepo(true)
        toast({ title: "Creating Repository...", description: "This might take a few moments." })
        
        try {
            const result = await createRepoAndPush({
                token: effectiveToken,
                name: newRepoName,
                description: newRepoDescription,
                isPrivate,
                files: localProject.files
            })
            
            if (result.success && result.url) {
                toast({ title: "Repository Created!", description: `Successfully created and pushed to ${result.url}` })
                // Load the new repo in GitOrbit
                const newRepoInfo: LoadedRepoInfo = { owner: user.displayName || 'user', repo: newRepoName, defaultBranch: 'main', url: result.url };
                setLoadedRepo(newRepoInfo);
                setLocalProject(null); // Clear local project
                router.push('/chat');
            } else {
                let errorMessage = result.error || "An unknown error occurred.";
                if (errorMessage.includes("name already exists on this account")) {
                    errorMessage = `A repository with the name "${newRepoName}" already exists on your account. Please choose a different name.`;
                }
                toast({ title: "Failed to Create Repo", description: errorMessage, variant: "destructive"})
            }
        } catch(error: any) {
            console.error("Repo creation failed:", error);
            toast({ title: "Failed to Create Repo", description: error.message, variant: "destructive"})
        } finally {
            setIsCreatingRepo(false)
        }
    }

    const clearLocalProject = () => {
        setLocalProject(null)
        setNewRepoName("")
        setNewRepoDescription("")
        toast({ title: "Ready for new project" })
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
            {!localProject ? (
                 <Tabs defaultValue="ai" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ai">Build with AI</TabsTrigger>
                        <TabsTrigger value="upload">Upload Folder</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ai">
                        <AiProjectGenerator onProjectCreate={onProjectCreate} />
                    </TabsContent>
                    <TabsContent value="upload">
                        <ProjectUploader onProjectCreate={onProjectCreate} />
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Folder /> Local Project Loaded: {localProject.name}</CardTitle>
                            <CardDescription>
                                {localProject.files.length} files loaded. You can now open this project in the editor, or create a new one.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button size="lg" asChild>
                                <Link href="/editor">
                                    <CodeXml className="mr-2"/> Open in Editor
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" onClick={clearLocalProject}>
                                <PlusSquare className="mr-2"/> Create a New Project
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Github /> Create a New GitHub Repository</CardTitle>
                            <CardDescription>Push your local project to a new repository on your GitHub account.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            {!effectiveToken && (
                                <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm flex items-center gap-2">
                                    <AlertCircle/>
                                    You must be signed in with GitHub or provide a PAT in settings to perform this action.
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="repo-name">Repository Name</Label>
                                <Input id="repo-name" value={newRepoName} onChange={e => setNewRepoName(e.target.value)} disabled={!effectiveToken} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="repo-desc">Description (Optional)</Label>
                                <Input id="repo-desc" value={newRepoDescription} onChange={e => setNewRepoDescription(e.target.value)} disabled={!effectiveToken} />
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch id="repo-private" checked={isPrivate} onCheckedChange={setIsPrivate} disabled={!effectiveToken} />
                                <Label htmlFor="repo-private">{isPrivate ? "Private" : "Public"} Repository</Label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleCreateRepo} disabled={!effectiveToken || isCreatingRepo || !newRepoName}>
                                {isCreatingRepo ? <Loader2 className="animate-spin" /> : <Github className="mr-2"/>}
                                Create Repository & Push
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    )
}
