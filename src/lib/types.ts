export type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: number
}

export type Transcript = {
  id: string
  originalContent: string
  summary: string
  actionItems: string
  createdAt: number
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
}

export type GitOrbotMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type ChatSession = {
  id: string
  repoUrl: string
  messages: ChatMessage[]
  createdAt: number
}

export type LoadedRepoInfo = {
  owner: string
  repo: string
  defaultBranch: string
  url: string
}

export type GitHubCommit = {
  sha: string
  commit: {
    author: {
      name: string
      date: string
    }
    message: string
  }
  html_url: string
}

export type CommitExplanation = {
  [sha: string]: {
    summary: string
    isLoading: boolean
    error?: string
  }
}

export type RepoFile = {
  path: string
  content: string
  mode: string
}

export type CommitActivity = {
  total: number
  week: number
  days: number[]
}[]

export type ContributorStats = {
  author: {
    login: string
    avatar_url: string
  }
  total: number
  weeks: {
    w: number
    a: number
    d: number
    c: number
  }[]
}[]

export type Issue = {
  state: "open" | "closed"
  pull_request?: object
}

export type HealthMetrics = {
  commitActivity: CommitActivity
  contributors: ContributorStats
  issues: { open: number; closed: number }
  pulls: { open: number; closed: number }
}

export type CachedHealthData = {
  metrics: HealthMetrics
  insights: string
  timestamp: number
}

export type RepoSearchResult = {
  name: string
  description: string
  url: string
}