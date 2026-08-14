/** 单个插件/仓库（来自 GitHub `dsh-plugin` 话题快照 + 精选列表分类） */
export interface Plugin {
  id: string
  name: string
  owner: string
  url: string
  homepage: string
  description: string
  language: string
  stars: number
  forks: number
  issues: number
  watchers: number
  createdAt: string
  updatedAt: string
  pushedAt: string
  topics: string[]
  archived: boolean
  isFork: boolean
  license: string
  category: string
  curated: boolean
}

export interface Stats {
  totalTopic: number
  fetched: number
  curated: number
  totalStars: number
  totalForks: number
  languages: number
  active30d: number
  archived: number
  categories: Record<string, number>
}

export interface DashboardData {
  meta: {
    topic: string
    topicUrl: string
    fetchedAt: string
    generatedBy: string
  }
  stats: Stats
  plugins: Plugin[]
}
