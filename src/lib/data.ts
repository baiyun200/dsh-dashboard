import rawData from "../data/plugins.json"
import type { DashboardData, Plugin } from "./types"

/** 内置数据快照（由 scripts/build-data.mjs 生成） */
export const snapshot = rawData as DashboardData

/** GitHub Pages 访问量徽章（第三方免费计数服务，每次加载计数 +1） */
export const VISITOR_BADGE_URL =
  "https://visitor-badge.laobi.icu/badge?page_id=baiyun200.dsh-dashboard"

/** 分类 → 徽章样式（静态类名，便于 Tailwind 收集） */
export const CATEGORY_BADGE: Record<string, string> = {
  核心与官方: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  "UI 增强": "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  会话与消息: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  工具与能力: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  工作流与自动化: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  通知与集成: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  开发与运行时: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  趣味: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30",
  精选列表: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
  基础设施与开发: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  其他: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
}

/** 分类 → 图表颜色（与 chart-N 主题变量呼应） */
export const CATEGORY_COLOR: Record<string, string> = {
  核心与官方: "var(--chart-1)",
  "UI 增强": "var(--chart-2)",
  会话与消息: "var(--chart-3)",
  工具与能力: "var(--chart-4)",
  工作流与自动化: "var(--chart-5)",
  通知与集成: "#e11d48",
  开发与运行时: "#64748b",
  趣味: "#ec4899",
  精选列表: "#0d9488",
  基础设施与开发: "#ea580c",
  其他: "#a1a1aa",
}

/** GitHub 语言 → 颜色（用于语言圆点） */
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  "Jupyter Notebook": "#da5b0b",
  Rust: "#dea584",
  Go: "#00add8",
  HTML: "#e34c26",
  CSS: "#663399",
  Shell: "#89e051",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Vue: "#41b883",
  Dart: "#00b4ab",
  Zig: "#ec915c",
  Elixir: "#6e4a7e",
  PowerShell: "#012456",
  Dockerfile: "#384d54",
  MDX: "#fcb32c",
  未知: "#8b8b8b",
}

export function langColor(lang: string): string {
  return LANG_COLORS[lang] ?? "#8b8b8b"
}

/** 插件安装命令（dsh bundle 方式） */
export function installCommand(p: Plugin): string {
  return `dsh plugin --profile web add "github:${p.id}"`
}

/** 按时间倒序的活跃插件（近 30 天有 push） */
export function recentActive(plugins: Plugin[], n = 8): Plugin[] {
  return [...plugins]
    .filter((p) => Date.now() - new Date(p.pushedAt).getTime() < 30 * 24 * 3600_000)
    .sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt))
    .slice(0, n)
}
