
"use client"

import { useState } from "react"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { type Note, type LoadedRepoInfo, type RepoFile } from "@/lib/types"
import { generateRepoNote } from "@/ai/flows/generate-repo-note"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Notebook, PlusCircle, Tag, Trash2, Bot, Sparkles, Download, Copy, Loader2, GitCommit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const RepoNoteGenerator = () => {
    const [loadedRepo] = useLocalStorage<LoadedRepoInfo | null>("gitorbit_loaded_repo", null)
    const [repoFiles] = useLocalStorage<RepoFile[]>("gitorbit_repo_files", [])
    const [generatedNote, setGeneratedNote] = useLocalStorage<string>("gitorbit_generated_note", "")
    const [isGenerating, setIsGenerating] = useState(false)
    const { toast } = useToast()

    const handleGenerateNote = async () => {
        if (!loadedRepo || repoFiles.length === 0) {
            toast({ title: "Error", description: "Repository context not found. Please load a repository on the Chat page first.", variant: "destructive" })
            return
        }

        setIsGenerating(true)
        setGeneratedNote("")
        toast({ title: "Generating Note...", description: "The AI is analyzing the repository. This might take a moment." })
        try {
            const filePaths = `File tree:\n${repoFiles.map(f => `- ${f.path}`).join('\n')}\n\n`;

            const keyFileIdentifiers = [
                'package.json',
                'next.config.ts',
                'tailwind.config.ts',
                'src/app/layout.tsx',
                'src/app/page.tsx',
                'README.md',
            ];

            const keyFilesContent = repoFiles
                .filter(file => keyFileIdentifiers.some(id => file.path.includes(id)))
                .map(f => `// FILE: ${f.path}\n\n${f.content}\n\n---\n\n`)
                .join('');
            
            const context = filePaths + "Key file contents:\n" + keyFilesContent;
            
            const note = await generateRepoNote({
                repoUrl: loadedRepo.url,
                context: context,
            })
            setGeneratedNote(note)
            toast({ title: "Note Generated", description: "AI-powered repository summary has been created." })
        } catch (error) {
            console.error("Error generating note:", error)
            toast({ title: "Error", description: "Failed to generate the repository note.", variant: "destructive" })
        } finally {
            setIsGenerating(false)
        }
    }

    const copyNote = () => {
        if (!generatedNote) return
        navigator.clipboard.writeText(generatedNote)
        toast({ title: "Copied!", description: "The note has been copied to your clipboard." })
    }

    const downloadNote = () => {
        if (!generatedNote) return
        const blob = new Blob([generatedNote], { type: "text/markdown;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${loadedRepo?.repo}-overview.md`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!loadedRepo) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot /> AI Repo Note</CardTitle>
                    <CardDescription>Generate a high-level technical overview of a repository.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                        <GitCommit className="h-10 w-10 mb-4" />
                        <h3 className="font-semibold">No Repository Loaded</h3>
                        <p className="text-sm max-w-sm mt-1">
                            To generate an AI-powered note, first load a repository on the{" "}
                            <Button variant="link" asChild className="p-0 h-auto align-baseline">
                                <Link href="/chat">Chat page</Link>
                            </Button>
                            .
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot /> AI Repo Note</CardTitle>
                <CardDescription>Generate a high-level technical overview of the loaded repository: <span className="font-semibold text-primary">{loadedRepo.owner}/{loadedRepo.repo}</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex flex-col items-center justify-center text-center py-4 bg-muted/50 rounded-lg">
                     <p className="mb-4 text-sm text-muted-foreground">Click the button below to generate a detailed summary of the repository.</p>
                    <Button onClick={handleGenerateNote} disabled={isGenerating}>
                       {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                       {generatedNote ? 'Re-generate Note' : 'Generate Note'}
                    </Button>
                 </div>
                {isGenerating && (
                     <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                         <Loader2 className="h-10 w-10 animate-spin mb-4" />
                         <h3 className="font-semibold">Generating Summary...</h3>
                     </div>
                )}
                {generatedNote && !isGenerating && (
                    <div className="space-y-4">
                        <article className="prose prose-sm dark:prose-invert max-w-none p-4 h-96 overflow-y-auto bg-muted rounded-md whitespace-pre-wrap font-code">
                           <div dangerouslySetInnerHTML={{ __html: generatedNote.replace(/\n/g, '<br />') }} />
                        </article>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={copyNote}><Copy className="mr-2" /> Copy</Button>
                            <Button onClick={downloadNote}><Download className="mr-2" /> Download as .md</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function NotesPage() {
  const [notes, setNotes] = useLocalStorage<Note[]>("gitorbit_notes", [])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const { toast } = useToast()

  const handleAddNote = () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Error", description: "Title and content cannot be empty.", variant: "destructive" })
      return
    }

    const newNote: Note = {
      id: new Date().toISOString(),
      title,
      content,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      createdAt: Date.now(),
    }
    setNotes([newNote, ...notes])
    setTitle("")
    setContent("")
    setTags("")
    toast({ title: "Note Saved", description: "Your new note has been saved locally." })
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
    toast({ title: "Note Deleted", description: "The note has been removed." })
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8">
      <RepoNoteGenerator />

      <Separator />

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col gap-8">
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <PlusCircle /> New Manual Note
                </CardTitle>
                <CardDescription>
                Create a new code note or snippet.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Input
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                placeholder="Note content, supports markdown..."
                className="h-48 font-code"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                />
                <Input
                placeholder="Tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                />
                <Button onClick={handleAddNote}>
                Save Note
                </Button>
            </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Notebook /> My Manual Notes
                    </CardTitle>
                    <CardDescription>
                    Your saved notes and snippets.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {notes.length === 0 ? (
                        <div className="text-center text-muted-foreground py-16">No manual notes yet. Create one to get started!</div>
                    ) : (
                        <div className="space-y-4">
                            {notes.map(note => (
                                <Card key={note.id}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-start">
                                        <span>{note.title}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNote(note.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        </CardTitle>
                                        <CardDescription>
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm font-code whitespace-pre-wrap bg-muted p-3 rounded-md">{note.content}</p>
                                    </CardContent>
                                    {note.tags.length > 0 && (
                                    <CardFooter className="flex gap-2 flex-wrap">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                        {note.tags.map(tag => (
                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                        ))}
                                    </CardFooter>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
