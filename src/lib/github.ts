import type { Plugin, Stats } from "./types"

/**
 * 从 GitHub API 实时刷新 `dsh-plugin` 话题数据。
 * 搜索接口未认证限额 10 次/分钟，这里只拉前 3 页（Top 300），失败时静默回退。
 */

interface RawRepo {
  full_name: string
  name: string
  owner?: { login?: string }
  html_url: string
  homepage?: string | null
  description?: string | null
  language?: string | null
  stargazers_count?: number
  forks_count?: number
  open_issues_count?: number
  watchers_count?: number
  created_at?: string
  updated_at?: string
  pushed_at?: string
  topics?: string[]
  archived?: boolean
  fork?: boolean
  license?: { spdx_id?: string | null } | null
}

export const TOPIC_URL = "https://github.com/topics/dsh-plugin"

/** 关键词兜底分类（与 scripts/build-data.mjs 保持一致） */
const KEYWORD_RULES: Array<[string[], string]> = [
  [["tui", "terminal", "sidebar", "skin", "skins", "navbar", "status", "composer", "web-ui", "webui", "pane", "theme", "wallpaper", "view-mode", "spinner", "desktop", "launcher", "dock", "panel", "overlay", "window"], "UI 增强"],
  [["session", "chat", "message", "memory", "conversation", "mnemon", "context", "share", "import", "history", "thread", "prompt", "rewind", "crosstalk"], "会话与消息"],
  [["notify", "telegram", "wechat", "weixin", "wecom", "feishu", "qq", "bot", "bridge", "channel", "im-", "integrat", "webhook"], "通知与集成"],
  [["workflow", "loop", "schedul", "cron", "automation", "team", "orchestr", "plan", "review-loop", "deep-research", "research", "specflow", "sentinel"], "工作流与自动化"],
  [["sandbox", "runtime", "eval", "test-runner", "plugin-check", "doctor", "debug", "profile", "registry", "metrics", "tps", "budget", "fallback", "security", "cost", "billing", "docker", "compat", "trace", "telemetry", "monitor"], "开发与运行时"],
  [["tool-", "-tool", "vision", "code", "search", "data-", "sql", "mcp", "ocr", "office", "excel", "pdf", "docx", "xlsx", "git", "skill", "agent", "openapi", "api-", "-api", "eyes", "screen", "wireframe", "kb-", "scholar", "stata", "mcp"], "工具与能力"],
  [["game", "pet", "emoji", "sticker", "fun", "ads", "stock", "douyin", "grok", "whale-girl", "gomoku", "chess", "minigame", "whale", "tavern", "manners"], "趣味"],
]

/** 保留内置快照中已有仓库的精选分类；新仓库用关键词兜底 */
export function categorizeWithSnapshot(fullName: string, name: string, description: string, snapshot: Plugin[]): string {
  const hit = snapshot.find((p) => p.id.toLowerCase() === fullName.toLowerCase())
  if (hit) return hit.category
  const full = fullName.toLowerCase()
  if (full === "deepseek-ai/deepseek-harness") return "核心与官方"
  if (/awesome/.test(name.toLowerCase())) return "精选列表"
  const desc = (description ?? "").toLowerCase()
  for (const [kws, cat] of KEYWORD_RULES) {
    if (kws.some((k) => desc.includes(k))) return cat
  }
  for (const [kws, cat] of KEYWORD_RULES) {
    if (kws.some((k) => name.toLowerCase().includes(k))) return cat
  }
  return "其他"
}

function normalize(raw: RawRepo, snapshot: Plugin[]): Plugin {
  return {
    id: raw.full_name,
    name: raw.name,
    owner: raw.owner?.login ?? "",
    url: raw.html_url,
    homepage: raw.homepage ?? "",
    description: (raw.description ?? "").trim(),
    language: raw.language ?? "未知",
    stars: raw.stargazers_count ?? 0,
    forks: raw.forks_count ?? 0,
    issues: raw.open_issues_count ?? 0,
    watchers: raw.watchers_count ?? 0,
    createdAt: raw.created_at ?? "",
    updatedAt: raw.updated_at ?? "",
    pushedAt: raw.pushed_at ?? "",
    topics: raw.topics ?? [],
    archived: !!raw.archived,
    isFork: !!raw.fork,
    license: raw.license?.spdx_id ?? "",
    category: categorizeWithSnapshot(raw.full_name, raw.name, raw.description ?? "", snapshot),
    curated: snapshot.some((p) => p.id.toLowerCase() === raw.full_name.toLowerCase() && p.curated),
  }
}

export function computeStats(plugins: Plugin[], totalTopic: number): Stats {
  const now = Date.now()
  const days30 = 30 * 24 * 3600_000
  return {
    totalTopic,
    fetched: plugins.length,
    curated: plugins.filter((p) => p.curated).length,
    totalStars: plugins.reduce((s, p) => s + p.stars, 0),
    totalForks: plugins.reduce((s, p) => s + p.forks, 0),
    languages: new Set(plugins.map((p) => p.language)).size,
    active30d: plugins.filter((p) => now - new Date(p.pushedAt).getTime() < days30).length,
    archived: plugins.filter((p) => p.archived).length,
    categories: Object.fromEntries(
      [...new Set(plugins.map((p) => p.category))].map((c) => [c, plugins.filter((p) => p.category === c).length]),
    ),
  }
}

export interface RefreshResult {
  plugins: Plugin[]
  stats: Stats
  totalTopic: number
  fetchedAt: string
}

/**
 * 从 GitHub API 实时刷新 `dsh-plugin` 话题数据。
 * 搜索接口未认证限额 10 次/分钟：这里顺序拉全 9 页（每页 100，共 ~900），
 * 与传入的现有数据按仓库 id 合并（API 数据优先覆盖、新仓库追加），
 * 因此刷新后仓库数量只增不减。遇到限流（403/429）提前停止，不中断已抓取部分。
 */
export async function fetchTopicRepos(base: Plugin[]): Promise<RefreshResult | null> {
  try {
    const byId = new Map(base.map((p) => [p.id.toLowerCase(), p]))
    let totalTopic = 0
    let fetchedAny = false
    for (let page = 1; page <= 9; page++) {
      const res = await fetch(
        `https://api.github.com/search/repositories?q=topic:dsh-plugin&sort=stars&order=desc&per_page=100&page=${page}`,
        { headers: { Accept: "application/vnd.github+json" } },
      )
      if (!res.ok) {
        if (res.status === 403 || res.status === 429) break // 限流，保留已抓取部分
        continue
      }
      const data = (await res.json()) as { total_count?: number; items?: RawRepo[] }
      totalTopic = Math.max(totalTopic, data.total_count ?? 0)
      const items = data.items ?? []
      for (const raw of items) {
        byId.set(raw.full_name.toLowerCase(), normalize(raw, base))
      }
      fetchedAny = true
      if (items.length < 100) break // 没有更多页
      await new Promise((r) => setTimeout(r, 400)) // 轻微延时，避免瞬时限流
    }
    if (!fetchedAny) return null
    const plugins = [...byId.values()].sort((a, b) => b.stars - a.stars)
    return {
      plugins,
      stats: computeStats(plugins, totalTopic),
      totalTopic,
      fetchedAt: new Date().toISOString(),
    }
  } catch {
    return null
  }
}
