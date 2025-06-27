
"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Bot, User, Loader2, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { askGitOrbot } from '@/ai/actions/gitorbot-chat'
import type { GitOrbotMessage } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

const initialMessages: GitOrbotMessage[] = [
  {
    role: 'assistant',
    content: 'Hello, I’m GitOrbot. Tell me what you\'d like to know about GitOrbit.',
  },
]

const suggestedQuestions = [
  'How do I use my GitHub PAT?',
  'Can I chat with any repository?',
  'What are the main features?',
]

export function GitOrbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<GitOrbotMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || input
    if (!content.trim()) return

    const newUserMessage: GitOrbotMessage = { role: 'user', content }
    setMessages(prev => [...prev, newUserMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await askGitOrbot([...messages, newUserMessage])
      const newBotMessage: GitOrbotMessage = { role: 'assistant', content: response }
      setMessages(prev => [...prev, newBotMessage])
    } catch (error) {
      console.error('GitOrbot Error:', error)
      toast({
        title: 'Error',
        description: 'Sorry, I couldn\'t get a response. Please try again.',
        variant: 'destructive',
      })
      const errorMessage: GitOrbotMessage = {
        role: 'assistant',
        content: 'I seem to be having trouble connecting. Please try again later.',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1, ease: 'easeOut' }}
        >
          <Button
            size="icon"
            className="w-16 h-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 animate-glow"
            onClick={() => setIsOpen(true)}
          >
            <MessageSquare className="h-8 w-8 text-primary-foreground" />
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-6 right-6 z-50 sm:bottom-24 sm:right-6"
          >
            <Card className="w-[calc(100vw-3rem)] max-w-sm h-[70vh] flex flex-col shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarFallback className="bg-muted">
                      <Bot className="text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">GitOrbot</p>
                    <p className="text-sm text-muted-foreground">Your friendly guide</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 p-0 min-h-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 ${
                          message.role === 'user' ? 'justify-end' : ''
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <Bot className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2 break-words text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-xl px-4 py-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4 border-t flex flex-col items-start gap-2">
                <div className="flex flex-wrap gap-2">
                  {messages.length <= 2 &&
                    suggestedQuestions.map(q => (
                      <Badge
                        key={q}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleSendMessage(q)}
                      >
                        {q}
                      </Badge>
                    ))}
                </div>
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex w-full items-center gap-2"
                >
                  <Input
                    placeholder="Ask about GitOrbit..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button size="icon" type="submit" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

    