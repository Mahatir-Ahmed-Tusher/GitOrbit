
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MessageSquare,
  GitCommit,
  Notebook,
  Network,
  CodeXml,
  Github,
  Sparkles,
  ShieldCheck,
} from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitOrbotWidget } from "@/components/gitorbot-widget"
import { useEffect, useState } from "react"

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="h-full bg-card/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
    <CardHeader className="flex flex-row items-center gap-4 pb-2">
      <div className="p-2 bg-primary/20 rounded-md">{icon}</div>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

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

export default function Home() {
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
        <div className="container relative overflow-hidden">
          <section className="pt-8 pb-12 relative">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 -z-20">
              <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
              <div 
                className="absolute inset-0 opacity-20 dark:opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(0deg, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}
              ></div>
            </div>
            
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[48rem] h-[48rem] bg-gradient-to-tl from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse [animation-delay:2s]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] bg-gradient-to-r from-primary/10 via-transparent to-accent/10 rounded-full blur-2xl -z-10 animate-pulse [animation-delay:4s]"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10 p-8 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/20">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="space-y-6 text-center md:text-left"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                        Your AI Co-Pilot for GitHub Repositories
                    </h1>
                    <p className="max-w-xl mx-auto md:mx-0 text-lg text-muted-foreground">
                        GitOrbit provides a suite of AI-powered tools to help you understand, navigate, and document any GitHub repository—all securely within your browser.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25">
                            <Link href="/home">
                                <Sparkles className="mr-2"/>
                                Launch Mission Control
                            </Link>
                        </Button>
                        <Button size="lg" variant="secondary" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20">
                            <Link href="https://mahatirtusher.github.io/thoughtexpedition.github.io/" target="_blank">
                                <Github className="mr-2"/>
                                Learn More on GitHub
                            </Link>
                        </Button>
                    </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="relative"
                >
                    <img src="/landing_omg.png" alt="Abstract representation of code and orbits" className="rounded-lg w-full h-auto"/>
                </motion.div>
            </div>
          </section>

          <section id="features" className="pt-8 pb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center space-y-4 mb-12"
            >
                <h2 className="text-3xl md:text-4xl font-headline font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">A Universe of Features</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground">
                    Everything you need to master a codebase, powered by Gemini.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="h-full"
                    >
                      <FeatureCard 
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                      />
                    </motion.div>
                  ))}
            </div>
          </section>

          <section className="py-8">
             <Card className="bg-gradient-to-br from-muted/50 to-muted/30 p-8 md:p-12 border-border/50 shadow-lg">
                 <div className="text-center space-y-4">
                     <h2 className="text-3xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Unlock Higher Rate Limits</h2>
                     <p className="max-w-2xl mx-auto text-muted-foreground">
                         GitOrbit works without any authentication. However, to avoid hitting GitHub's public API rate limits when analyzing larger repositories, you can provide a Personal Access Token (PAT).
                     </p>
                     <Button variant="secondary" className="shadow-md border border-border hover:border-primary/50 hover:bg-primary/5" asChild>
                        <Link href="/settings">
                            Go to Settings to add your token
                        </Link>
                     </Button>
                 </div>
             </Card>
          </section>

          <section className="pt-8 pb-8">
            <div className="relative rounded-xl border border-border/20 bg-gradient-to-br from-primary/10 via-background/50 to-accent/10 p-8 md:p-12 overflow-hidden shadow-2xl">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl -z-10 animate-pulse [animation-delay:2s]"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                <motion.div
                    className="md:col-span-1 flex justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <Link href="https://codecraftdev.vercel.app/" target="_blank" rel="noopener noreferrer" className="block p-4 bg-card/50 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-border/50 hover:border-primary/30">
                        <img src="/codecraft_logo.png" alt="CodeCraft AI Logo" className="h-56 w-56 object-contain" />
                    </Link>
                </motion.div>
                <motion.div
                    className="md:col-span-1 text-center md:text-left"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl font-bold font-headline flex items-center justify-center md:justify-start gap-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        <Sparkles className="text-accent h-8 w-8" /> Try our CodeCraft
                    </h2>
                    <p className="max-w-xl mx-auto md:mx-0 mt-4 text-foreground/90 text-lg">
                        Explore a platform where you can build entire web applications using natural language. It leverages AI to generate code, provides an interactive editor, and offers live previews with WebContainer technology.
                    </p>
                    <Button asChild size="lg" className="mt-6 shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                        <Link href="https://codecraftdev.vercel.app/" target="_blank" rel="noopener noreferrer">
                            Visit CodeCraft AI
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                        </Link>
                    </Button>
                </motion.div>
                </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t bg-gradient-to-b from-background to-muted/20 pt-8">
        <div className="container py-12 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-semibold text-foreground mb-4">About</h3>
                    <ul className="space-y-2">
                        <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><Link href="/chat" className="text-muted-foreground hover:text-primary transition-colors">Chat</Link></li>
                        <li><Link href="/editor" className="text-muted-foreground hover:text-primary transition-colors">Editor</Link></li>
                        <li><Link href="/commits" className="text-muted-foreground hover:text-primary transition-colors">Commits</Link></li>
                        <li><Link href="/notes" className="text-muted-foreground hover:text-primary transition-colors">Notes</Link></li>
                        <li><Link href="/user-guide" className="text-muted-foreground hover:text-primary transition-colors">User Guide</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                    <ul className="space-y-2">
                        <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-4">Socials</h3>
                    <div className="flex space-x-4">
                        <Link href="https://github.com/Mahatir-Ahmed-Tusher/GitOrbit" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Github className="h-6 w-6" />
                            <span className="sr-only">GitHub</span>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-border/50 text-center text-muted-foreground">
                © {new Date().getFullYear()} GitOrbit. All Rights Reserved.
            </div>
        </div>
    </footer>
    <GitOrbotWidget />
    </div>
  )
}
