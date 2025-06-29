
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
           <Link href="/" className="mr-4 flex items-center">
            <img src="/git_logo.png" alt="GitOrbit Logo" className="h-10 w-auto" />
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
             <ThemeToggle />
             <Button variant="ghost" asChild>
                <Link href="/user-guide">User Guide</Link>
            </Button>
             <Link href="https://github.com/Mahatir-Ahmed-Tusher/GitOrbit" target="_blank" rel="noopener noreferrer">
                <img src="/github.png" alt="GitHub" className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container relative py-20 md:py-24">
           <div className="max-w-3xl mx-auto">
             {children}
           </div>
        </div>
      </main>

       <footer className="border-t bg-background">
        <div className="container py-12 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-semibold text-foreground mb-4">About</h3>
                    <ul className="space-y-2">
                        <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                        <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><Link href="/chat" className="text-muted-foreground hover:text-primary">Chat</Link></li>
                        <li><Link href="/editor" className="text-muted-foreground hover:text-primary">Editor</Link></li>
                        <li><Link href="/commits" className="text-muted-foreground hover:text-primary">Commits</Link></li>
                        <li><Link href="/notes" className="text-muted-foreground hover:text-primary">Notes</Link></li>
                        <li><Link href="/user-guide" className="text-muted-foreground hover:text-primary">User Guide</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                    <ul className="space-y-2">
                        <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-4">Socials</h3>
                    <div className="flex space-x-4">
                        <Link href="https://github.com/Mahatir-Ahmed-Tusher/GitOrbit" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <img src="/github.png" alt="GitHub" className="h-6 w-6" />
                            <span className="sr-only">GitHub</span>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
                © {new Date().getFullYear()} GitOrbit. All Rights Reserved.
            </div>
        </div>
    </footer>
    </div>
  )
}
