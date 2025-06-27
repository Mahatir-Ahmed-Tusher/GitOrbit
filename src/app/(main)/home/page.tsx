"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { isBinary } from "@/lib/utils"
import { type LoadedRepoInfo, type GitHubCommit, type RepoFile, type RepoSearchResult } from "@/lib/types"
import { searchRepos } from "@/ai/actions/search-repos"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Github, History, Loader2, MessageSquare, GitCommit, Notebook, Network, CodeXml, ShieldCheck, Info, Search, AlertCircle } from "lucide-react"

const features = [
  { 
    icon: <MessageSquare className="text-primary"/>,
    title: "AI Code Chat",
    description: "Ask questions about the entire codebase in natural language. Get instant, context-aware answers."
  },
  { 
    icon: <GitCommit className="text-primary"/>,
    title: "Commit Explorer",
    description: "Understand the story behind every change. Get AI-powered explanations for any commit diff."
  },
  { 
    icon: <Notebook className="text-primary"/>,
    title: "AI-Generated Notes",
    description: "Automatically generate high-level technical documentation for any repository. Perfect for onboarding."
  },
  { 
    icon: <Network className="text-primary"/>,
    title: "Codebase Visualization",
    description: "Visualize the entire file structure of a repository as an interactive diagram."
  },
  { 
    icon: <CodeXml className="text-primary"/>,
    title: "In-Browser Code Editor",
    description: "Explore, read, and even edit code with a familiar Monaco-based editor, right in your browser."
  },
  { 
    icon: <ShieldCheck className="text-primary"/>,
    title: "Privacy First",
    description: "All data, including your code and optional GitHub token, is stored exclusively in your browser's local storage."
  }
];

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex items-start gap-4">
    <div className="p-2 bg-primary/20 rounded-md flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-md font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
)

const RepoSearch = ({ onRepoSelect }: { onRepoSelect: (url: string) => void }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<RepoSearchResult[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchError(null);
        setSearchResults([]);

        try {
            const results = await searchRepos(searchQuery);
            if (results.length === 0) {
                setSearchError("No relevant repositories found for your query.");
            }
            setSearchResults(results);
        } catch (error: any) {
            console.error("Search failed:", error);
            setSearchError(error.message || "An unknown error occurred during search.");
            toast({ title: "Search Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSearching(false);
        }
    };

    const handleResultClick = (result: RepoSearchResult) => {
        onRepoSelect(result.url);
        setSelectedUrl(result.url);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search /> Discover Repositories</CardTitle>
                <CardDescription>Search for repositories by topic, name, or user.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g., 'React state management libraries'"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={isSearching}
                    />
                    <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                        {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                        <span className="hidden sm:inline ml-2">Search</span>
                    </Button>
                </div>
                
                <div className="mt-4 min-h-[10rem] animate-fade-in">
                    {isSearching && (
                        <div className="flex justify-center items-center h-full text-muted-foreground">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Searching...
                        </div>
                    )}
                    {searchError && !isSearching && (
                        <div className="flex flex-col justify-center items-center h-full text-destructive">
                           <AlertCircle className="mr-2 h-5 w-5" /> {searchError}
                        </div>
                    )}
                    {!isSearching && !searchError && searchResults.length > 0 && (
                        <ScrollArea className="h-64 pr-4">
                            <div className="space-y-2">
                                {searchResults.map((result) => (
                                    <Button
                                        key={result.url}
                                        variant="outline"
                                        className={`w-full h-auto text-left justify-start p-3 ${selectedUrl === result.url ? 'border-primary' : ''}`}
                                        onClick={() => handleResultClick(result)}
                                    >
                                        <div className="flex flex-col">
                                            <p className="font-semibold text-primary">{result.name}</p>
                                            <p className="text-xs text-muted-foreground whitespace-normal">{result.description}</p>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                     {!isSearching && !searchError && searchResults.length === 0 && (
                         <div className="flex justify-center items-center h-full text-center text-muted-foreground p-4">
                             <p>Search for repositories to see results here.</p>
                         </div>
                     )}
                </div>
            </CardContent>
        </Card>
    );
};


export default function HomePage() {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [loadedRepo, setLoadedRepo] = useLocalStorage<LoadedRepoInfo | null>('gitorbit_loaded_repo', null)
  const [repoHistory, setRepoHistory] = useLocalStorage<LoadedRepoInfo[]>('gitorbit_repo_history', [])
  const [githubPat] = useLocalStorage("gitorbit_github_pat", "")
  const [, setCommits] = useLocalStorage<GitHubCommit[]>('gitorbit_commits', [])
  const [, setRepoFiles] = useLocalStorage<RepoFile[]>("gitorbit_repo_files", [])
  const [, setGeneratedNote] = useLocalStorage<string>("gitorbit_generated_note", "")
  const [, setMessages] = useLocalStorage<any[]>("gitorbit_chat_messages", [])

  const { toast } = useToast()

  const parseRepoUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split("/").filter(Boolean)
      if (urlObj.hostname === "github.com" && pathParts.length >= 2) {
        return { owner: pathParts[0], repo: pathParts[1] }
      }
    } catch (e) {
      console.error("Invalid URL format:", e)
    }
    return null
  }

  const handleLoadRepo = async (urlToLoad?: string) => {
    const targetUrl = urlToLoad || repoUrl;
    if (!targetUrl) return
    const repoInfo = parseRepoUrl(targetUrl)

    if (!repoInfo) {
      toast({ title: "Error", description: "Invalid GitHub repository URL format. Please use a URL like https://github.com/owner/repo.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    toast({ title: "Analyzing Repository...", description: "This may take a moment. We're fetching commits and file contents." })
    
    const headers = new Headers({ 'Accept': 'application/vnd.github.v3+json' });
    if (githubPat) {
      headers.set('Authorization', `Bearer ${githubPat}`);
    }

    try {
      const repoDetailsResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`, { headers });
      if (!repoDetailsResponse.ok) {
        let errorMessage = `Failed to load the repository. It might be private, not exist, or the URL could be incorrect.`;
        if (repoDetailsResponse.status === 403) {
            errorMessage += ` You may have hit a GitHub API rate limit. Please add a Personal Access Token in Settings to increase the limit.`
        } else if (repoDetailsResponse.status === 404) {
            errorMessage = `Repository not found. Please check the URL. It might be private or contain a typo.`;
        }
        toast({ title: "Error Loading Repo", description: errorMessage, variant: "destructive" });
        return;
      }
      const repoDetails = await repoDetailsResponse.json();
      const defaultBranch = repoDetails.default_branch;

      const [commitsResponse, treeResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits?sha=${defaultBranch}&per_page=30`, { headers }),
        fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${defaultBranch}?recursive=1`, { headers })
      ]);

      if (!commitsResponse.ok || !treeResponse.ok) {
          toast({ title: "Error", description: "Failed to fetch repository details.", variant: "destructive" });
          return;
      }
      
      const fetchedCommits = await commitsResponse.json();
      const treeData = await treeResponse.json();

      if (treeData.truncated) {
          toast({ title: "Warning", description: "Repository is large. Analyzing the first 100 files.", variant: "default" });
      }

      const filesToFetch = treeData.tree
        .filter((node: any) => node.type === 'blob' && !isBinary(node.path))
        .slice(0, 100); 

      const contentPromises = filesToFetch.map(async (file: any) => {
        try {
            const res = await fetch(file.url, { headers });
            if (!res.ok) return null;
            const blobData = await res.json();
            if (blobData.encoding === 'base64') {
              const content = atob(blobData.content);
              return { path: file.path, content, mode: file.mode };
            }
            return null;
        } catch (e) {
            return null;
        }
      });
      
      const fetchedFiles = (await Promise.all(contentPromises)).filter(Boolean) as RepoFile[];
      
      const newRepoInfo = { owner: repoInfo.owner, repo: repoInfo.repo, defaultBranch, url: targetUrl };

      // Persist to local storage
      setRepoFiles(fetchedFiles);
      setLoadedRepo(newRepoInfo);
      setCommits(fetchedCommits);
      setGeneratedNote("")
      setMessages([]) // Clear chat from previous repo

      // Update repo history
      setRepoHistory(prevHistory => {
        const newHistory = prevHistory.filter(r => r.url !== targetUrl)
        newHistory.unshift(newRepoInfo)
        return newHistory.slice(0, 5) // Keep last 5
      })

      toast({ title: "Repository Loaded!", description: `Successfully analyzed ${repoInfo.owner}/${repoInfo.repo}.`})
      router.push('/chat')

    } catch (error: any) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        toast({
          title: "Storage Limit Exceeded",
          description: "This repository is too large to store in your browser. Please try a smaller repository.",
          variant: "destructive",
        });
        setRepoFiles([]);
      } else {
        console.error("Error loading repository:", error);
        toast({ title: "Error", description: "An unexpected error occurred while loading the repository.", variant: "destructive" })
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Github /> Welcome to GitOrbit Mission Control
          </CardTitle>
          <CardDescription>
            {loadedRepo ? 
              <>Currently exploring <a href={loadedRepo.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{loadedRepo.owner}/{loadedRepo.repo}</a>. Load another below.</> :
              "Start by loading a public GitHub repository to explore its universe."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
             <div className="flex gap-2">
                <Input
                  placeholder="https://github.com/example/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadRepo()}
                  className="h-10 text-base"
                />
                <Button onClick={() => handleLoadRepo()} disabled={isLoading || !repoUrl} size="lg">
                  {isLoading ? (<Loader2 className="mr-2 h-5 w-5 animate-spin" />) : "Load Repo"}
                </Button>
            </div>
            
            <div className="flex items-start gap-2 p-3 text-xs text-muted-foreground bg-background/50 rounded-lg">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>
                    For private repositories, please add your GitHub Personal Access Token in the{" "}
                    <Link href="/settings" className="font-semibold text-primary hover:underline">
                        settings
                    </Link>
                    .
                </span>
            </div>

            {repoHistory.length > 0 && (
                <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <History className="h-4 w-4" />
                        <span>Recent Projects:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {repoHistory.map(repo => (
                            <Button key={repo.url} variant="outline" size="sm" onClick={() => handleLoadRepo(repo.url)} disabled={isLoading}>
                                {repo.owner}/{repo.repo}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <RepoSearch onRepoSelect={setRepoUrl} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>Explore what you can do with GitOrbit</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                 {features.map((feature, index) => (
                    <FeatureCard 
                      key={index}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                    />
                  ))}
              </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>What is GitOrbit?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                 <p>GitOrbit provides a suite of AI-powered tools to help you understand, navigate, and document any GitHub repository.</p>
                 <p>It's designed for developers, team leads, and anyone who needs to quickly get up to speed with a new codebase. All analysis happens securely in your browser.</p>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Why use a GitHub PAT?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>GitOrbit works without any authentication for public repositories. However, GitHub limits unauthenticated API requests to 60 per hour.</p>
                <p>By providing a Personal Access Token (PAT), you increase this limit to 5,000 requests per hour, allowing you to analyze larger repositories without interruption.</p>
                <div className="flex items-start gap-2 p-3 bg-background rounded-lg mt-2">
                    <Info className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                    <span>Your token is stored securely in your browser's local storage and is never sent to any server other than GitHub's.</span>
                </div>
                <Button variant="secondary" size="sm" className="w-full mt-2" asChild>
                    <Link href="/settings">
                        Go to Settings to add your token
                    </Link>
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
