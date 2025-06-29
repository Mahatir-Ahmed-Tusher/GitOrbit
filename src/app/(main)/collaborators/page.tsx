
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { type LoadedRepoInfo, type GitHubCollaborator } from "@/lib/types"
import { getCollaborators, addCollaborator, removeCollaborator } from "./actions"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Users, UserPlus, Trash2, ShieldCheck, AlertCircle, GitCommit, ExternalLink, Info } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CollaboratorsPage() {
    const [loadedRepo] = useLocalStorage<LoadedRepoInfo | null>("gitorbit_loaded_repo", null)
    const [githubPat] = useLocalStorage("gitorbit_github_pat", "")
    const { githubToken } = useAuth()
    const { toast } = useToast()

    const [collaborators, setCollaborators] = useState<GitHubCollaborator[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [inviteUsername, setInviteUsername] = useState("")
    const [isInviting, setIsInviting] = useState(false)

    const effectiveToken = githubToken || githubPat

    const fetchCollaborators = useCallback(async () => {
        if (!loadedRepo || !effectiveToken) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)
        const result = await getCollaborators({
            owner: loadedRepo.owner,
            repo: loadedRepo.repo,
            token: effectiveToken,
        })

        if (result.error) {
            setError(result.error)
            toast({ title: "Error", description: result.error, variant: "destructive" })
        } else if (result.data) {
            setCollaborators(result.data)
        }
        setIsLoading(false)
    }, [loadedRepo, effectiveToken, toast])

    useEffect(() => {
        fetchCollaborators()
    }, [fetchCollaborators])

    const handleInvite = async () => {
        if (!loadedRepo || !effectiveToken || !inviteUsername.trim()) return

        setIsInviting(true)
        const result = await addCollaborator({
            owner: loadedRepo.owner,
            repo: loadedRepo.repo,
            token: effectiveToken,
            username: inviteUsername,
        })
        setIsInviting(false)

        if (result.success) {
            toast({ title: "Invitation Sent", description: `${inviteUsername} will receive an email from GitHub with an invitation to join this repository.` })
            setInviteUsername("")
            fetchCollaborators()
        } else {
            toast({ title: "Invitation Failed", description: result.error, variant: "destructive" })
        }
    }

    const handleRemove = async (username: string) => {
        if (!loadedRepo || !effectiveToken) return

        const originalCollaborators = [...collaborators]
        setCollaborators(collaborators.filter(c => c.login !== username))

        const result = await removeCollaborator({
            owner: loadedRepo.owner,
            repo: loadedRepo.repo,
            token: effectiveToken,
            username: username,
        })

        if (result.success) {
            toast({ title: "Collaborator Removed", description: `${username} has been removed.` })
        } else {
            toast({ title: "Failed to Remove", description: result.error, variant: "destructive" })
            setCollaborators(originalCollaborators)
        }
    }

    if (!loadedRepo) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-center p-4">
                <GitCommit className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">Manage Collaborators</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                    To manage collaborators, first load a repository on the{" "}
                    <Button variant="link" asChild className="p-0 h-auto align-baseline text-base">
                        <Link href="/home">Home page</Link>
                    </Button>
                    .
                </p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Users /> Collaborators
                    </CardTitle>
                    <CardDescription>
                        Manage who can contribute to{" "}
                        <a href={loadedRepo.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                            {loadedRepo.owner}/{loadedRepo.repo}
                        </a>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 border bg-muted/50 rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><UserPlus /> Invite a New Collaborator</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                             <Input
                                placeholder="GitHub username"
                                value={inviteUsername}
                                onChange={(e) => setInviteUsername(e.target.value)}
                                disabled={isInviting || !effectiveToken}
                             />
                             <Button onClick={handleInvite} disabled={isInviting || !inviteUsername.trim() || !effectiveToken}>
                                {isInviting ? <Loader2 className="mr-2 animate-spin" /> : <UserPlus className="mr-2" />}
                                Send Invitation
                             </Button>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5 pt-2">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                                When you send an invitation, the user will receive an email from GitHub. They must accept the invitation to become a collaborator.
                            </span>
                        </p>
                         {!effectiveToken && (
                            <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> You must be signed in or have a PAT set in Settings to manage collaborators.</p>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Current Collaborators</h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                                <Loader2 className="mr-2 animate-spin" /> Loading...
                            </div>
                        ) : error ? (
                             <div className="flex flex-col items-center justify-center py-8 text-destructive text-center">
                                <AlertCircle className="h-8 w-8 mb-2" />
                                <p className="font-semibold">{error}</p>
                            </div>
                        ) : collaborators.length > 0 ? (
                            <div className="space-y-2">
                                {collaborators.map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-md bg-background">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={c.avatar_url} alt={c.login} />
                                                <AvatarFallback>{c.login.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <a href={c.html_url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline flex items-center gap-1">
                                                    {c.login} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                                </a>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    {c.permissions.admin && <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-red-500" /> Admin</span>}
                                                    {c.permissions.push && !c.permissions.admin && <span className="flex items-center gap-1">Write</span>}
                                                    {c.permissions.pull && !c.permissions.push && <span>Read</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" disabled={!c.permissions.admin && !effectiveToken}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Remove {c.login}?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to remove this collaborator? They will lose access to the repository. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleRemove(c.login)} className="bg-destructive hover:bg-destructive/90">
                                                        Remove
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No collaborators found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
