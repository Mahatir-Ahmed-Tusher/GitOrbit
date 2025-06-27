
"use client"

import { useState } from "react"
import Link from "next/link"
import { chatWithRepo } from "@/ai/flows/chat-with-repo"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, MessageSquare } from "lucide-react"
import { type ChatMessage, type LoadedRepoInfo, type GitHubCommit, type RepoFile } from "@/lib/types"

export default function ChatPage() {
  const [loadedRepo] = useLocalStorage<LoadedRepoInfo | null>('gitorbit_loaded_repo', null)
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>("gitorbit_chat_messages", [])
  const [currentMessage, setCurrentMessage] = useState("")
  
  const [commits] = useLocalStorage<GitHubCommit[]>('gitorbit_commits', [])
  const [repoFiles] = useLocalStorage<RepoFile[]>("gitorbit_repo_files", [])

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !loadedRepo) return

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: currentMessage,
    }
    const loadingMessage: ChatMessage = {
      id: String(Date.now() + 1),
      role: "assistant",
      content: "Thinking...",
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    const question = currentMessage
    setCurrentMessage("")

    try {
      const questionLower = question.toLowerCase()
      const questionWords = new Set(questionLower.split(/\s+/).filter(w => w.length > 3 || questionLower.includes(w)))

      const relevantFiles = repoFiles.filter(file => {
        const pathLower = file.path.toLowerCase()
        const contentLower = file.content.substring(0, 2000).toLowerCase()
        return Array.from(questionWords).some(word => pathLower.includes(word) || contentLower.includes(word))
      }).slice(0, 10)

      const filesContext = "Repository Code Files:\n\n" + relevantFiles.map(f => `// FILE: ${f.path}\n\n${f.content}\n\n---\n\n`).join('');
      const commitHistory = `Recent Commits:\n${commits.slice(0, 10).map((c: any) => `- ${c.commit.message.split('\n')[0]} (by ${c.commit.author.name})`).join('\n')}\n\n---\n\n`;
      const finalContext = commitHistory + filesContext;

      const aiResponse = await chatWithRepo({
        repoUrl: loadedRepo.url,
        question: question,
        context: finalContext,
      })

      const assistantMessage: ChatMessage = {
        id: loadingMessage.id,
        role: "assistant",
        content: aiResponse.answer,
      }
      setMessages((prev) => [...prev.slice(0, -1), assistantMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorMessage: ChatMessage = {
        id: loadingMessage.id,
        role: "assistant",
        content: "Sorry, I encountered an error. Please check the developer console for details.",
      }
      setMessages((prev) => [...prev.slice(0, -1), errorMessage])
    }
  }

  if (!loadedRepo) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold">Ready to Chat?</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          To begin asking questions about a repository, please load one on the{" "}
          <Button variant="link" asChild className="p-0 h-auto align-baseline text-base">
            <Link href="/home">Home page</Link>
          </Button>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-2 p-4 sm:p-6 md:p-8">
      <div className="flex items-center text-sm text-muted-foreground">
          <p>
              Chatting with <a href={loadedRepo.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{loadedRepo.owner}/{loadedRepo.repo}</a>.
              {messages.length === 0 && " Ask your first question below."}
          </p>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 bg-background rounded-lg border">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar>
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-4xl min-w-0 rounded-xl px-4 py-3 break-words ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-sm font-code whitespace-pre-wrap max-h-[30rem] overflow-y-auto">
                      {message.isLoading ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> {message.content}</div> : message.content}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar>
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-2 bg-background">
            <div className="relative">
              <Textarea
                placeholder="Ask a question about the code... (Shift + Enter for new line)"
                className="pr-16 resize-none min-h-[40px] h-10"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 bottom-1.5 h-8 w-8"
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
      </div>
    </div>
  )
}
