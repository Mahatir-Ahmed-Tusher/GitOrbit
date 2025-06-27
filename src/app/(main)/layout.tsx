
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4">
                <SidebarTrigger />
                <Link href="/" className="flex items-center md:hidden">
                    <Image src="/git_logo.png" alt="GitOrbit Logo" width={32} height={32} className="h-8 w-auto" />
                </Link>
            </header>
            <div className="flex-1 flex flex-col min-h-0 h-full">
              {children}
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
