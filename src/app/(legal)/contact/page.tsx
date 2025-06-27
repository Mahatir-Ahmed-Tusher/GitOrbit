
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Github, Linkedin } from "lucide-react"

export default function ContactPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Contact</CardTitle>
        <CardDescription>Get in touch with the developer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
            <Github className="h-6 w-6 text-muted-foreground" />
            <div>
                <p className="font-semibold text-foreground">GitHub</p>
                <a href="https://github.com/Mahatir-Ahmed-Tusher" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Mahatir-Ahmed-Tusher
                </a>
            </div>
        </div>
         <div className="flex items-center gap-4">
            <Linkedin className="h-6 w-6 text-muted-foreground" />
            <div>
                <p className="font-semibold text-foreground">LinkedIn</p>
                <a href="https://in.linkedin.com/in/mahatir-ahmed-tusher-5a5524257" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Mahatir Ahmed Tusher
                </a>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
