#!/usr/bin/env node
/**
 * 数据构建脚本：将 GitHub `dsh-plugin` 话题的仓库快照 + awesome 精选列表
 * 加工成看板所需的 src/data/plugins.json（含中文分类）。
 *
 * 用法：npm run data
 * 输入：topic_page1-6.json（GitHub 搜索 API 快照）、awesome_*.md（精选列表）
 * 输出：src/data/plugins.json
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

// ---------- 1. 读取 GitHub 快照 ----------
const pages = []
let totalTopic = 0
for (let p = 1; p <= 9; p++) {
  try {
    const d = JSON.parse(readFileSync(join(root, `data/raw/topic_page${p}.json`), "utf8"))
    pages.push(...(d.items ?? []))
    totalTopic = Math.max(totalTopic, d.total_count ?? 0)
  } catch {
    // 缺页时静默跳过
  }
}
if (pages.length === 0) {
  console.error("未找到 data/raw/topic_page*.json 数据，请先运行 fetch 脚本。")
  process.exit(1)
}

// 去重（按 full_name）
const seen = new Set()
const repos = pages.filter((r) => {
  if (seen.has(r.full_name)) return false
  seen.add(r.full_name)
  return true
})

// ---------- 2. 精选列表分类 ----------
const AWESOME_CATEGORIES = {
  "UI Enhancements": "UI 增强",
  "Sessions & Messages": "会话与消息",
  "Tools & Capabilities": "工具与能力",
  "Workflow & Automation": "工作流与自动化",
  "Notifications & Integrations": "通知与集成",
  "Development & Runtime": "开发与运行时",
  "Just for Fun": "趣味",
  "Core & Official": "核心与官方",
  "Context & Search": "上下文与搜索",
  "Input & Editing": "输入与编辑",
  "UI & Experience": "UI 与体验",
  "Browser & Remote": "浏览器与远程",
  "Models & Inference": "模型与推理",
  "Git & Engineering": "Git 与工程",
  "Notifications & Channels": "通知与渠道",
  "Fun & Lifestyle": "趣味与生活",
  "Infrastructure & Development": "基础设施与开发",
}

function parseAwesome(file, out) {
  let filePath = join(root, "data/raw", file)
  let text
  try {
    text = readFileSync(filePath, "utf8")
  } catch {
    return
  }
  let cat = null
  for (const line of text.split("\n")) {
    const h = line.match(/^### (.+)$/)
    if (h) {
      cat = AWESOME_CATEGORIES[h[1].trim()] ?? h[1].trim()
      continue
    }
    const m = line.match(/^- \[([^\]]+)\]\((https?:\/\/github\.com\/([^/)]+\/[^/)]+))\)/)
    if (m && cat) {
      const repo = m[3].replace(/\.git$/, "")
      out.set(repo.toLowerCase(), cat)
    }
  }
}

// 后写覆盖先写，因此按优先级倒序解析：先 harness，再 plugin（plugin 分类优先）
const curated = new Map()
parseAwesome("awesome_dsh_harness.md", curated)
parseAwesome("awesome_dsh_plugin.md", curated)

// ---------- 3. 关键词兜底分类 ----------
const KEYWORD_RULES = [
  [["tui", "terminal", "sidebar", "skin", "skins", "navbar", "status", "composer", "web-ui", "webui", "pane", "theme", "wallpaper", "view-mode", "spinner", "desktop", "launcher", "dock", "panel", "overlay", "window"], "UI 增强"],
  [["session", "chat", "message", "memory", "conversation", "mnemon", "context", "share", "import", "history", "thread", "prompt", "rewind", "crosstalk"], "会话与消息"],
  [["notify", "telegram", "wechat", "weixin", "wecom", "feishu", "qq", "bot", "bridge", "channel", "im-", "integrat", "webhook"], "通知与集成"],
  [["workflow", "loop", "schedul", "cron", "automation", "team", "orchestr", "plan", "review-loop", "deep-research", "research", "specflow", "sentinel"], "工作流与自动化"],
  [["sandbox", "runtime", "eval", "test-runner", "plugin-check", "doctor", "debug", "profile", "registry", "metrics", "tps", "budget", "fallback", "security", "cost", "billing", "docker", "compat", "trace", "telemetry", "monitor"], "开发与运行时"],
  [["tool-", "-tool", "vision", "code", "search", "data-", "sql", "mcp", "ocr", "office", "excel", "pdf", "docx", "xlsx", "git", "skill", "agent", "openapi", "api-", "-api", "eyes", "screen", "wireframe", "kb-", "scholar", "stata", "mcp"], "工具与能力"],
  [["game", "pet", "emoji", "sticker", "fun", "ads", "stock", "douyin", "grok", "whale-girl", "gomoku", "chess", "minigame", "whale", "tavern", "manners"], "趣味"],
]

function categorize(repo) {
  const full = repo.full_name.toLowerCase()
  const name = repo.name.toLowerCase()
  const desc = (repo.description ?? "").toLowerCase()

  // 官方 / 元项目
  if (full === "deepseek-ai/deepseek-harness") return "核心与官方"
  if (/awesome/.test(name) || /curated|radar/.test(desc)) return "精选列表"
  if (/^dsh-external\/hub$|plugin-registry|plugin-manager-registry|marisa|dshp$/.test(full)) return "基础设施与开发"

  const curatedCat = curated.get(full.toLowerCase())
  if (curatedCat) return curatedCat

  // 关键词规则：描述优先，其次名字
  for (const [kws, cat] of KEYWORD_RULES) {
    if (kws.some((k) => desc.includes(k))) return cat
  }
  for (const [kws, cat] of KEYWORD_RULES) {
    if (kws.some((k) => name.includes(k))) return cat
  }
  return "其他"
}

// ---------- 4. 归一化 ----------
function normalize(r) {
  return {
    id: r.full_name,
    name: r.name,
    owner: r.owner?.login ?? "",
    url: r.html_url,
    homepage: r.homepage || "",
    description: (r.description ?? "").trim(),
    language: r.language ?? "未知",
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    issues: r.open_issues_count ?? 0,
    watchers: r.watchers_count ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at,
    topics: r.topics ?? [],
    archived: !!r.archived,
    isFork: !!r.fork,
    license: r.license?.spdx_id ?? "",
    category: categorize(r),
    curated: curated.has(r.full_name.toLowerCase()),
  }
}

const plugins = repos.map(normalize).sort((a, b) => b.stars - a.stars)

// ---------- 5. 统计 ----------
const now = new Date()
const days30 = 30 * 24 * 60 * 60 * 1000
const stats = {
  totalTopic, // 话题仓库总数（来自最后一次快照）
  fetched: plugins.length,
  curated: plugins.filter((p) => p.curated).length,
  totalStars: plugins.reduce((s, p) => s + p.stars, 0),
  totalForks: plugins.reduce((s, p) => s + p.forks, 0),
  languages: new Set(plugins.map((p) => p.language)).size,
  active30d: plugins.filter((p) => now.getTime() - new Date(p.pushedAt).getTime() < days30).length,
  archived: plugins.filter((p) => p.archived).length,
  categories: Object.fromEntries(
    [...new Set(plugins.map((p) => p.category))].map((c) => [
      c,
      plugins.filter((p) => p.category === c).length,
    ])
  ),
}

const out = {
  meta: {
    topic: "dsh-plugin",
    topicUrl: "https://github.com/topics/dsh-plugin",
    fetchedAt: new Date().toISOString(),
    generatedBy: "scripts/build-data.mjs",
  },
  stats,
  plugins,
}

mkdirSync(join(root, "src/data"), { recursive: true })
writeFileSync(join(root, "src/data/plugins.json"), JSON.stringify(out, null, 2))
console.log(
  `✓ 已生成 src/data/plugins.json：${plugins.length} 个仓库，` +
    `精选 ${stats.curated}，总 Star ${stats.totalStars.toLocaleString()}，` +
    `分类 ${Object.keys(stats.categories).length} 种`
)
