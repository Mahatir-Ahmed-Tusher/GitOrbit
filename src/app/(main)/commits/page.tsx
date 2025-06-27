
"use client"

import { useState } from "react"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { explainCommit } from "@/ai/flows/summarize-commit"
import { type GitHubCommit, type LoadedRepoInfo, type CommitExplanation } from "@/lib/types"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, GitCommit, ExternalLink, Lightbulb, ServerCrash, RefreshCw } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function CommitsPage() {
  const [loadedRepo] = useLocalStorage<LoadedRepoInfo | null>("gitorbit_loaded_repo", null)
  const [commits, setCommits] = useLocalStorage<GitHubCommit[]>("gitorbit_commits", [])
  const [githubPat] = useLocalStorage("gitorbit_github_pat", "")
  const [explanations, setExplanations] = useState<CommitExplanation>({})
  const [isPulling, setIsPulling] = useState(false)
  const { toast } = useToast()

  const handlePullCommits = async () => {
    if (!loadedRepo) return;

    setIsPulling(true);
    toast({ title: "Pulling latest commits..." });

    const headers = new Headers({ 'Accept': 'application/vnd.github.v3+json' });
    if (githubPat) {
      headers.set('Authorization', `Bearer ${githubPat}`);
    }

    try {
      const commitsResponse = await fetch(`https://api.github.com/repos/${loadedRepo.owner}/${loadedRepo.repo}/commits?sha=${loadedRepo.defaultBranch}&per_page=30`, { headers });
      
      if (!commitsResponse.ok) {
        throw new Error(`Failed to fetch commits: ${commitsResponse.statusText}`);
      }

      const fetchedCommits = await commitsResponse.json();
      setCommits(fetchedCommits);
      setExplanations({}); // Clear old explanations
      toast({ title: "Success", description: "Latest commits have been pulled." });

    } catch (error: any) {
      console.error("Error pulling commits:", error);
      toast({ title: "Error", description: "Failed to pull the latest commits.", variant: "destructive" });
    } finally {
      setIsPulling(false);
    }
  };


  const handleExplain = async (sha: string) => {
    if (!loadedRepo) return
    // Do not re-fetch if summary already exists
    if (explanations[sha]?.summary) return

    setExplanations(prev => ({
      ...prev,
      [sha]: { ...prev[sha], isLoading: true, error: undefined }
    }))

    const headers = new Headers({ 'Accept': 'application/vnd.github.v3.diff' })
    if (githubPat) {
      headers.set('Authorization', `Bearer ${githubPat}`)
    }

    try {
      const diffResponse = await fetch(`https://api.github.com/repos/${loadedRepo.owner}/${loadedRepo.repo}/commits/${sha}`, { headers })
      if (!diffResponse.ok) {
        throw new Error(`Failed to fetch commit diff: ${diffResponse.statusText}`)
      }
      const diff = await diffResponse.text()

      const summary = await explainCommit(diff)

      setExplanations(prev => ({
        ...prev,
        [sha]: { summary, isLoading: false }
      }))

    } catch (error: any) {
      console.error("Error explaining commit:", error)
      toast({ title: "Error", description: "Failed to generate explanation for the commit.", variant: "destructive" })
      setExplanations(prev => ({
        ...prev,
        [sha]: { ...prev[sha], isLoading: false, error: error.message || "An unknown error occurred." }
      }))
    }
  }

  if (!loadedRepo) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 h-full p-4 sm:p-6 md:p-8">
        <GitCommit className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold">Commit Explorer</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          To explore and explain commits, first load a repository on the{" "}
          <Button variant="link" asChild className="p-0 h-auto align-baseline text-base">
            <Link href="/home">Home page</Link>
          </Button>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitCommit /> Commit Explorer
              </CardTitle>
              <CardDescription>
                Showing the {commits.length} most recent commits for{" "}
                <a href={loadedRepo.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  {loadedRepo.owner}/{loadedRepo.repo}
                </a>
                . Click on a commit to get an AI-powered explanation.
              </CardDescription>
            </div>
            <Button onClick={handlePullCommits} disabled={isPulling} className="flex-shrink-0">
              {isPulling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Pull Commits
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {commits.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No commits found for this repository.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {commits.map((commit) => (
                <AccordionItem key={commit.sha} value={commit.sha} className="border rounded-md px-4" onClick={() => handleExplain(commit.sha)}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 text-left w-full">
                       <Avatar className="h-8 w-8 hidden sm:flex">
                         <AvatarFallback>{commit.commit.author.name.charAt(0)}</AvatarFallback>
                       </Avatar>
                       <div className="flex-1 truncate">
                          <p className="font-medium truncate">{commit.commit.message.split('\n')[0]}</p>
                          <p className="text-xs text-muted-foreground">
                            {commit.commit.author.name} committed {formatDistanceToNow(new Date(commit.commit.author.date), { addSuffix: true })}
                          </p>
                       </div>
                       <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                         {commit.sha.substring(0, 7)}
                         <a href={commit.html_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="View on GitHub">
                           <ExternalLink className="h-4 w-4 hover:text-primary"/>
                         </a>
                       </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 bg-muted/50 rounded-md">
                      {explanations[commit.sha]?.isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                           <Loader2 className="h-4 w-4 animate-spin"/> Generating explanation...
                        </div>
                      ) : explanations[commit.sha]?.error ? (
                         <div className="flex items-start gap-2 text-destructive">
                           <ServerCrash className="h-4 w-4 mt-1 flex-shrink-0" />
                           <div>
                             <p className="font-semibold">Failed to get explanation</p>
                             <p className="text-xs">{explanations[commit.sha]?.error}</p>
                           </div>
                         </div>
                      ) : explanations[commit.sha]?.summary ? (
                         <div className="space-y-4">
                           <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-500" /> AI Explanation</h4>
                           <div className="text-sm whitespace-pre-wrap font-code">{explanations[commit.sha]?.summary}</div>
                         </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                           Click to generate an AI explanation for this commit.
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
