
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function UserGuidePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">GitOrbit User Guide</CardTitle>
        <CardDescription>Your comprehensive guide to navigating the universe of code with GitOrbit.</CardDescription>
      </CardHeader>
      <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-6">
        
        <section id="getting-started">
          <h2 className="text-xl font-semibold text-foreground">Getting Started: Loading a Repository</h2>
          <p>The first step in GitOrbit is to load a GitHub repository. You can do this from the <Link href="/home">Home page</Link>.</p>
          <h3 className="font-semibold text-foreground">Public Repositories</h3>
          <p>Simply paste the full URL of any public GitHub repository (e.g., <code>https://github.com/facebook/react</code>) into the input field and click "Load Repo". GitOrbit will begin analyzing the repository's structure, files, and commit history.</p>
          <h3 className="font-semibold text-foreground">Private Repositories & Personal Access Tokens (PATs)</h3>
          <p>To access private repositories, you must provide a GitHub Personal Access Token (PAT). A PAT is also recommended for heavy use of public repos to avoid hitting GitHub's API rate limits (5,000 requests/hour with a token vs. 60 without).</p>
          <ol>
            <li>Go to the <Link href="/settings">Settings</Link> page in GitOrbit.</li>
            <li>Paste your GitHub PAT into the designated field and save it.</li>
            <li>Your token is stored securely in your browser's local storage and is never sent to any server other than GitHub's.</li>
          </ol>
        </section>

        <section id="core-features">
          <h2 className="text-xl font-semibold text-foreground">Core Features</h2>
          
          <h3 className="font-semibold text-foreground">Chat with Repo</h3>
          <p>The Chat page is where you can have a conversation with the codebase. Ask questions in natural language about how features are implemented, where specific logic resides, or what recent changes have been made. The AI uses the repository's files and commit history as context to provide accurate, in-depth answers.</p>
          
          <h3 className="font-semibold text-foreground">Editor</h3>
          <p>The Editor provides a familiar, VS Code-like environment to browse the entire file tree of the loaded repository. You can read code, understand the project structure, and even make edits. Use the AI Assistant (<code>Ctrl + I</code>) to ask for code modifications or explanations directly within the editor.</p>
          
          <h3 className="font-semibold text-foreground">Commits</h3>
          <p>Explore the repository's history on the Commits page. It lists the most recent commits. Click on any commit to get a detailed, AI-powered explanation of the changes (the "diff"), making it easy to understand the story behind every update.</p>

          <h3 className="font-semibold text-foreground">Health</h3>
          <p>The Health dashboard gives you a high-level overview of the repository's vitality. It visualizes commit frequency and top contributors, and uses AI to generate actionable insights and identify potential red flags based on the repository's activity.</p>

          <h3 className="font-semibold text-foreground">Notes</h3>
          <p>The Notes page features two powerful documentation tools:</p>
          <ul>
            <li><strong>AI Repo Note:</strong> Automatically generate a comprehensive, high-level technical overview of the repository. Perfect for onboarding new developers or quickly understanding a new project.</li>
            <li><strong>Manual Notes:</strong> A space for you to jot down your own notes, thoughts, and code snippets. These are saved locally for your reference.</li>
          </ul>

          <h3 className="font-semibold text-foreground">Transcripts</h3>
          <p>Paste a meeting transcript into the summarizer to quickly extract key discussion points and a list of actionable items, helping you keep track of important decisions and tasks.</p>

          <h3 className="font-semibold text-foreground">Visualize</h3>
          <p>Get a bird's-eye view of the project's structure. The Visualize page generates an interactive diagram of the file tree, helping you understand the architecture and component relationships at a glance.</p>
        </section>

        <section id="settings">
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          <p>The <Link href="/settings">Settings</Link> page allows you to manage your GitOrbit experience.</p>
          <ul>
            <li><strong>GitHub Token:</strong> Add or update your GitHub PAT.</li>
            <li><strong>Data Management:</strong> Export all your GitOrbit data (notes, history, etc.) as a JSON file for backup, import data from a file, or erase all data from your browser.</li>
            <li><strong>Theme:</strong> Toggle between light and dark mode.</li>
          </ul>
        </section>

      </CardContent>
    </Card>
  )
}
