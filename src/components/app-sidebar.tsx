
"use client"

import {
  GitCommit,
  MessageSquare,
  Notebook,
  Settings,
  FileText,
  Network,
  CodeXml,
  History,
  Home,
  HeartPulse,
  MoreHorizontal,
  Trash2,
  LogOut,
  User as UserIcon,
  Users,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { type LoadedRepoInfo } from "@/lib/types"
import { useAuth } from "@/components/providers/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"


export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading } = useAuth()

  const [repoHistory, setRepoHistory] = useLocalStorage<LoadedRepoInfo[]>('gitorbit_repo_history', [])
  const [loadedRepo, setLoadedRepo] = useLocalStorage<LoadedRepoInfo | null>('gitorbit_loaded_repo', null)

  const handleProjectClick = (repo: LoadedRepoInfo) => {
    setLoadedRepo(repo)
    router.push('/chat')
  }

  const handleRemoveProject = (urlToRemove: string) => {
    setRepoHistory(prev => prev.filter(r => r.url !== urlToRemove));
  };

  const menuItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/editor", label: "Editor", icon: CodeXml },
    { href: "/commits", label: "Commits", icon: GitCommit },
    { href: "/health", label: "Health", icon: HeartPulse },
    { href: "/notes", label: "Notes", icon: Notebook },
    { href: "/transcripts", label: "Transcripts", icon: FileText },
    { href: "/visualize", label: "Visualize", icon: Network },
    { href: "/collaborators", label: "Collaborators", icon: Users },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center justify-start border-b border-sidebar-border px-4 group-data-[state=collapsed]:justify-center">
        <Link href="/" className="flex items-center gap-2 font-bold">
            <img src="/git_logo.png" alt="GitOrbit Logo" className="h-8 w-auto object-contain flex-shrink-0" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className="w-full">
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        {user && repoHistory.length > 0 && (
          <>
            <Separator className="my-1" />
            <div className="p-2 pt-2">
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider group-data-[state=collapsed]:hidden">
                    Your Projects
                </h3>
                <SidebarMenu>
                  {repoHistory.map((repo) => (
                    <SidebarMenuItem key={repo.url}>
                        <SidebarMenuButton
                            onClick={() => handleProjectClick(repo)}
                            tooltip={`${repo.owner}/${repo.repo}`}
                            size="sm"
                            className="w-full"
                            isActive={loadedRepo?.url === repo.url && (pathname.startsWith('/chat') || pathname.startsWith('/editor') || pathname.startsWith('/commits') || pathname.startsWith('/notes') || pathname.startsWith('/visualize') || pathname.startsWith('/health'))}
                        >
                            <History className="h-4 w-4" />
                            <span className="truncate">{repo.repo}</span>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction>
                                    <MoreHorizontal />
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    onClick={() => handleRemoveProject(repo.url)}
                                >
                                    <Trash2 className="mr-2" />
                                    Remove
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
            </div>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-1" />
        <SidebarMenu>
            <SidebarMenuItem>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            variant="ghost"
                            className="w-full justify-start group-data-[collapsible=icon]:w-auto"
                            tooltip="Account Settings"
                        >
                            {loading ? (
                                <div className="h-8 w-8 rounded-full bg-sidebar-border/50 animate-pulse" />
                            ) : user ? (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                    <AvatarFallback>
                                        <UserIcon />
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <UserIcon />
                            )}
                             <span className="truncate">{user?.displayName ?? 'Not Signed In'}</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                        {user ? (
                        <>
                            <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                                </p>
                            </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </DropdownMenuItem>
                        </>
                        ) : (
                             <DropdownMenuItem asChild>
                                <Link href="/home">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign In
                                </Link>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
