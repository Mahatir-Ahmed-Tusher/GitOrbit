
"use client"

import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { summarizeTranscript } from "@/ai/flows/summarize-transcript"
import { type Transcript } from "@/lib/types"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText, Copy, Trash2, History } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatDistanceToNow } from "date-fns"
import { Separator } from "@/components/ui/separator"

export default function TranscriptsPage() {
  const [transcriptContent, setTranscriptContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transcripts, setTranscripts] = useLocalStorage<Transcript[]>("gitorbit_transcripts", [])
  const { toast } = useToast()

  const handleSummarize = async () => {
    if (!transcriptContent.trim()) {
      toast({ title: "Error", description: "Transcript content cannot be empty.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const { summary, actionItems } = await summarizeTranscript({ transcript: transcriptContent })
      const newTranscript: Transcript = {
        id: new Date().toISOString(),
        originalContent: transcriptContent,
        summary,
        actionItems,
        createdAt: Date.now(),
      }
      setTranscripts([newTranscript, ...transcripts])
      setTranscriptContent("")
      toast({ title: "Success", description: "Transcript summarized and saved." })
    } catch (error) {
      console.error("Error summarizing transcript:", error)
      toast({ title: "Error", description: "Failed to summarize transcript.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTranscript = (id: string) => {
    setTranscripts(transcripts.filter(t => t.id !== id))
    toast({ title: "Transcript Deleted", description: "The transcript has been removed." })
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: "Content copied to clipboard." })
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText /> Transcript Summarizer
            </CardTitle>
            <CardDescription>
              Paste a meeting transcript to get key discussion points and action items.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea
              placeholder="Paste transcript here..."
              className="h-64 font-code"
              value={transcriptContent}
              onChange={(e) => setTranscriptContent(e.target.value)}
            />
            <Button onClick={handleSummarize} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Summarize Transcript
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <History /> Saved Transcripts
            </CardTitle>
            <CardDescription>
                View and manage your past transcript summaries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transcripts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No transcripts yet.</div>
            ) : (
                <Accordion type="single" collapsible className="w-full">
                    {transcripts.map((t) => (
                        <AccordionItem key={t.id} value={t.id}>
                            <AccordionTrigger>
                                <div className="flex flex-col text-left">
                                    <span className="font-semibold truncate">Transcript from {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}</span>
                                    <span className="text-xs text-muted-foreground font-normal">{t.summary.substring(0, 50)}...</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Summary</h4>
                                        <p className="text-sm whitespace-pre-wrap font-code bg-muted p-3 rounded-md">{t.summary}</p>
                                    </div>
                                    <Separator />
                                     <div>
                                        <h4 className="font-semibold mb-2">Action Items</h4>
                                        <p className="text-sm whitespace-pre-wrap font-code bg-muted p-3 rounded-md">{t.actionItems}</p>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`Summary:\n${t.summary}\n\nAction Items:\n${t.actionItems}`)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteTranscript(t.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
