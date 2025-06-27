
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
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

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
        
        {repoHistory.length > 0 && (
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
                 <Link href="/settings" className="w-full">
                    <SidebarMenuButton
                        isActive={pathname === "/settings"}
                        tooltip="Settings"
                    >
                        <Settings />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
