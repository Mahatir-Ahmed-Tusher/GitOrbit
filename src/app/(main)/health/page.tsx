
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { analyzeRepoHealth } from "@/ai/flows/analyze-repo-health"
import { type LoadedRepoInfo, type HealthMetrics, type CachedHealthData, type ContributorStats, type CommitActivity, type Issue } from "@/lib/types"

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { motion } from "framer-motion"
import { format, subDays } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, HeartPulse, AlertCircle, GitPullRequest, CircleDot } from "lucide-react"

// Helper components for charts
const CommitActivityChart = ({ data }: { data: CommitActivity }) => {
    const chartData = data.map(week => ({
        name: format(new Date(week.week * 1000), 'MMM d'),
        commits: week.total,
    })).slice(-12) // Last 12 weeks

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Commit Frequency (Last 12 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
                        <Line type="monotone" dataKey="commits" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

const ContributorsChart = ({ data }: { data: ContributorStats }) => {
    const chartData = data
        .slice(0, 10)
        .map(c => ({
            name: c.author.login,
            commits: c.total,
            avatar: c.author.avatar_url,
        }))
        .sort((a, b) => b.commits - a.commits)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
                        <Bar dataKey="commits" fill="hsl(var(--primary))" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

const IssueStats = ({ issues, pulls }: { issues: Issue[], pulls: Issue[] }) => {
    const openIssues = issues.filter(i => i.state === 'open').length;
    const closedIssues = issues.length - openIssues;
    const openPulls = pulls.filter(p => p.state === 'open').length;
    const closedPulls = pulls.length - openPulls;

    const stats = [
        { icon: <CircleDot className="text-green-500" />, label: "Open Issues", value: openIssues },
        { icon: <GitPullRequest className="text-red-500" />, label: "Open PRs", value: openPulls },
        { icon: <CircleDot className="text-muted-foreground" />, label: "Closed Issues", value: closedIssues },
        { icon: <GitPullRequest className="text-muted-foreground" />, label: "Merged/Closed PRs", value: closedPulls },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Issues & PRs</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                {stats.map(stat => (
                    <div key={stat.label} className="p-4 bg-muted/50 rounded-lg flex items-start gap-4">
                        <div className="text-primary">{stat.icon}</div>
                        <div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export default function HealthPage() {
    const [loadedRepo] = useLocalStorage<LoadedRepoInfo | null>("gitorbit_loaded_repo", null)
    const [githubPat] = useLocalStorage("gitorbit_github_pat", "")
    const [healthData, setHealthData] = useState<CachedHealthData | null>(null)
    
    const [isLoading, setIsLoading] = useState(false)
    const [isComputing, setIsComputing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState('30')
    const { toast } = useToast()

    const fetchHealthData = useCallback(async () => {
        if (!loadedRepo) return
        
        setIsLoading(true)
        setError(null)
        setHealthData(null)
        setIsComputing(false)

        const sinceDate = subDays(new Date(), parseInt(timeRange)).toISOString()
        
        const headers = new Headers({ 'Accept': 'application/vnd.github.v3+json' });
        if (githubPat) headers.set('Authorization', `Bearer ${githubPat}`);
        
        try {
            // Check cache
            const cacheKey = `gitorbit_health_${loadedRepo.url}_${timeRange}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                const parsed = JSON.parse(cachedData) as CachedHealthData
                // Use cache if it's less than an hour old
                if (Date.now() - parsed.timestamp < 3600000) {
                    setHealthData(parsed)
                    setIsLoading(false)
                    toast({ title: "Loaded from cache" })
                    return
                }
            }

            toast({ title: "Fetching repo health data..." })
            
            const [commitActivityRes, contributorsRes, issuesRes, pullsRes] = await Promise.all([
                fetch(`https://api.github.com/repos/${loadedRepo.owner}/${loadedRepo.repo}/stats/commit_activity`, { headers }),
                fetch(`https://api.github.com/repos/${loadedRepo.owner}/${loadedRepo.repo}/stats/contributors`, { headers }),
                fetch(`https://api.github.com/repos/${loadedRepo.owner}/${loadedRepo.repo}/issues?state=all&since=${sinceDate}&per_page=100`, { headers }),
                fetch(`https://api.github.com/repos/${loadedRepo.owner}/${loadedRepo.repo}/pulls?state=all&per_page=100`, { headers }),
            ]);

            if (commitActivityRes.status === 202 || contributorsRes.status === 202) {
                setIsComputing(true)
                setIsLoading(false)
                toast({ title: "Hold on...", description: "GitHub is generating statistics for this repository." })
                return
            }
            
            if (!commitActivityRes.ok || !contributorsRes.ok || !issuesRes.ok || !pullsRes.ok) {
                 throw new Error(`Failed to fetch repo health data. Statuses: Commits ${commitActivityRes.status}, Contribs ${contributorsRes.status}, Issues ${issuesRes.status}, PRs ${pullsRes.status}`);
            }

            const metrics: HealthMetrics = {
                commitActivity: await commitActivityRes.json(),
                contributors: await contributorsRes.json(),
                issues: (await issuesRes.json()).filter((issue: any) => !issue.pull_request),
                pulls: await pullsRes.json(),
            }
            
            toast({ title: "Analyzing data with AI..." })
            const insights = await analyzeRepoHealth({ repoUrl: loadedRepo.url, metrics })

            const newData: CachedHealthData = { metrics, insights, timestamp: Date.now() }
            setHealthData(newData)
            localStorage.setItem(cacheKey, JSON.stringify(newData));

        } catch (e: any) {
            console.error("Failed to fetch or analyze health data:", e)
            setError(e.message || "An unknown error occurred.")
            toast({ title: "Error", description: e.message, variant: "destructive" })
        } finally {
            setIsLoading(false)
        }

    }, [loadedRepo, githubPat, timeRange, toast]);

    useEffect(() => {
        if (loadedRepo) {
            fetchHealthData()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadedRepo]) 

    if (!loadedRepo) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 h-full">
                <HeartPulse className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">Repository Health</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                To view health metrics, first load a repository on the{" "}
                <Button variant="link" asChild className="p-0 h-auto align-baseline text-base">
                    <Link href="/home">Home page</Link>
                </Button>
                .
                </p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <HeartPulse /> Health Dashboard
                            </CardTitle>
                            <CardDescription>
                                An overview of activity for{" "}
                                <a href={loadedRepo.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                                {loadedRepo.owner}/{loadedRepo.repo}
                                </a>.
                            </CardDescription>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                    <SelectItem value="90">Last 90 days</SelectItem>
                                    <SelectItem value="365">Last Year</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={fetchHealthData} disabled={isLoading || isComputing}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Refresh"}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {isLoading && !healthData && (
                <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin mb-4" />
                    <h3 className="text-lg font-semibold">Fetching & Analyzing Data...</h3>
                    <p>This can take a moment for large repositories.</p>
                </div>
            )}

            {isComputing && !isLoading && (
                 <Card className="border-primary/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary"><Loader2 className="animate-spin" /> Preparing Your Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>GitHub is currently computing the repository statistics. This is a one-time process for new or rarely-viewed repositories and can take a few moments.</p>
                        <p className="text-muted-foreground text-sm mt-2">Please try refreshing in a minute.</p>
                    </CardContent>
                </Card>
            )}

            {error && !isLoading && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive"><AlertCircle /> An Error Occurred</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            )}

            {healthData && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <Card>
                         <CardHeader>
                            <CardTitle className="text-lg">AI Health Insights</CardTitle>
                            <CardDescription>Generated by AI based on the latest metrics.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <article className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-code bg-muted p-4 rounded-md">
                                {healthData.insights}
                            </article>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                           <CommitActivityChart data={healthData.metrics.commitActivity} />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                           <ContributorsChart data={healthData.metrics.contributors} />
                        </motion.div>
                         <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                           <IssueStats issues={healthData.metrics.issues} pulls={healthData.metrics.pulls} />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
