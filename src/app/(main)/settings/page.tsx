
"use client"

import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Github, Key, Info, Download, Upload, Trash2, ShieldCheck } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
  const [githubPat, setGithubPat] = useLocalStorage("gitorbit_github_pat", "")
  const { toast } = useToast()

  const handleSaveToken = () => {
    toast({
      title: "Token Saved",
      description: "Your GitHub PAT has been saved to local storage.",
    })
  }

  const handleExportData = () => {
    const data: { [key: string]: any } = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("gitorbit_")) {
        data[key] = JSON.parse(localStorage.getItem(key)!)
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "gitorbit-data.json"
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Data Exported", description: "Your data has been downloaded." })
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        Object.keys(data).forEach(key => {
          if (key.startsWith("gitorbit_")) {
            localStorage.setItem(key, JSON.stringify(data[key]))
          }
        })
        toast({ title: "Import Successful", description: "Your data has been restored. Please refresh the page." })
      } catch (error) {
        toast({ title: "Import Failed", description: "The selected file is not valid JSON.", variant: "destructive" })
      }
    }
    reader.readAsText(file)
  }

  const handleEraseData = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("gitorbit_")) {
        localStorage.removeItem(key)
      }
    })
    toast({ title: "Data Erased", description: "All application data has been removed from your browser. Please refresh." })
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Github /> GitHub Token</CardTitle>
          <CardDescription>
            Optionally add a Personal Access Token (PAT) to increase API rate limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github-pat"><Key className="inline-block h-4 w-4 mr-1" />Personal Access Token</Label>
            <Input
              id="github-pat"
              type="password"
              placeholder="ghp_..."
              value={githubPat}
              onChange={(e) => setGithubPat(e.target.value)}
            />
             <p className="text-xs text-muted-foreground pt-1">
              <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  See how to retrieve a Personal Access Token
              </a>
            </p>
          </div>
          <Button onClick={handleSaveToken}>Save Token</Button>
          <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <Info className="h-4 w-4 mt-1 flex-shrink-0" />
            <span>Your token is stored securely in your browser's local storage and is never sent to any server other than GitHub's.</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> Data Management</CardTitle>
                <CardDescription>
                    Manage your application data. All data is stored locally on your device.
                </CardDescription>
            </div>
            <ThemeToggle />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
          <Button variant="outline" asChild>
            <label htmlFor="import-file">
              <Upload className="mr-2 h-4 w-4" /> Import Data
              <input type="file" id="import-file" className="hidden" accept=".json" onChange={handleImportData} />
            </label>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Erase All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your saved chats, summaries, notes, and settings from this browser.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEraseData}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
