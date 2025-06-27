
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Github, Sparkles, User, GraduationCap } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AboutPage() {
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
             <Button asChild>
                <Link href="/home">Get Started</Link>
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
             <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold">About GitOrbit</CardTitle>
                  <CardDescription className="text-lg">
                    Your AI Co-Pilot for GitHub Repositories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground">
                    <p>GitOrbit provides a suite of AI-powered tools to help you understand, navigate, and document any GitHub repository. It's designed for developers, team leads, and anyone who needs to quickly get up to speed with a new codebase. All analysis happens securely in your browser, powered by Google's Gemini models.</p>
                    
                    <div className="space-y-4 rounded-lg border bg-muted/50 p-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground"><User /> The Developer</h3>
                        <div className="flex items-center gap-4">
                             <img src="https://github.com/Mahatir-Ahmed-Tusher.png" alt="Mahatir Ahmed Tusher" className="h-20 w-20 rounded-full" />
                             <div>
                                 <h4 className="font-bold text-xl text-foreground">Mahatir Ahmed Tusher</h4>
                                 <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4"/> Student at Vellore Institute of Technology (VIT)</p>
                                 <Button asChild variant="link" className="p-0 h-auto">
                                    <a href="https://github.com/Mahatir-Ahmed-Tusher" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        <Github className="h-4 w-4"/>
                                        GitHub Profile
                                    </a>
                                 </Button>
                             </div>
                        </div>
                    </div>
                     <div className="text-center pt-4">
                        <Button asChild size="lg">
                            <Link href="/home">
                                <Sparkles className="mr-2"/>
                                Launch Mission Control
                            </Link>
                        </Button>
                    </div>
                </CardContent>
             </Card>
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
                            <Github className="h-6 w-6" />
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
