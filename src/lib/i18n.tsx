import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

export type Locale = "zh" | "en"

const LS_KEY = "dsh-dash-lang"

/** 首次进入：localStorage 记忆优先，其次按浏览器语言自动选择，其余默认英文 */
function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved === "zh" || saved === "en") return saved
  } catch {
    /* ignore */
  }
  try {
    const nav = (navigator.language ?? "").toLowerCase()
    return nav.startsWith("zh") ? "zh" : "en"
  } catch {
    return "en"
  }
}

const zh = {
  // 全局 / App
  "app.title": "DSH 插件看板 · DeepSeek Harness 插件生态",
  "app.heroTitle": "DeepSeek Harness 插件生态",
  "app.heroDesc1":
    "DeepSeek Harness 信奉「一切皆插件」——模型、工具、沙箱、会话存储、UI 乃至智能体循环本身都可以被插件替换与扩展。本看板基于 GitHub",
  "app.heroDesc2": "话题与社区精选列表，汇总插件的热度、语言、分类与活跃度。",
  "app.categoryHeading": "分类总览",
  "app.clearFilter": "清除筛选（当前：{cat}）",
  "app.pluginHeading": "插件列表",
  "toast.refreshFail": "刷新失败",
  "toast.refreshFailDesc": "GitHub API 请求受限或网络不可用，已保持当前数据。",
  "toast.refreshOk": "数据已刷新",
  "toast.refreshOkDesc": "已更新 {n} 个仓库 · 话题总数 {total}",

  // 头部
  "header.title": "DSH 插件看板",
  "header.badge": "DeepSeek Harness 插件生态",
  "header.snapshot": "数据快照 · {time}",
  "header.refreshing": " · 刷新中…",
  "header.visitorTitle": "GitHub Pages 累计访问量（第三方计数服务，每次页面加载 +1）",
  "header.visits": "访问量",
  "header.visitorAlt": "GitHub Pages 访问量",
  "header.refreshTitle": "从 GitHub 重新拉取 dsh-plugin 话题数据（Top 300）",
  "header.refresh": "刷新数据",
  "header.toggleLight": "切换浅色模式",
  "header.toggleDark": "切换深色模式",
  "header.repoTitle": "本看板源码仓库",
  "header.language": "切换语言",

  // 统计卡片
  "stat.repos": "话题收录仓库",
  "stat.reposHint": "GitHub dsh-plugin 话题共 {n} 个",
  "stat.curated": "精选插件",
  "stat.curatedHint": "来自社区维护的 awesome 列表",
  "stat.stars": "累计 Star",
  "stat.starsHint": "均分 {n}",
  "stat.forks": "累计 Fork",
  "stat.forksHint": "社区复刻与协作",
  "stat.active": "近 30 天活跃",
  "stat.activeHint": "有最新提交的仓库",
  "stat.langs": "开发语言",
  "stat.langsHint": "TypeScript 主导的生态",

  // 分类总览
  "cat.clearTitle": "点击取消筛选",
  "cat.filterTitle": "筛选「{cat}」",
  "cat.percent": "占 {p}%",

  // 插件表格
  "table.searchPlaceholder": "搜索名称 / 作者 / 描述 / 主题标签…",
  "table.allCategories": "全部分类",
  "table.catWithCount": "{cat}（{n}）",
  "table.allLanguages": "全部语言",
  "table.sort": "排序",
  "table.sortStars": "按 Star",
  "table.sortForks": "按 Fork",
  "table.sortUpdated": "按最近更新",
  "table.sortCreated": "按创建时间",
  "table.sortName": "按名称",
  "table.sortAsc": "当前升序，点击切换降序",
  "table.sortDesc": "当前降序，点击切换升序",
  "table.curatedOnly": "仅看精选",
  "table.headRepo": "仓库",
  "table.headCategory": "分类",
  "table.headLanguage": "语言",
  "table.headUpdated": "最近更新",
  "table.headActions": "操作",
  "table.curatedAria": "精选",
  "table.archived": "已归档",
  "table.viewDetail": "查看详情",
  "table.emptyTitle": "没有找到匹配的插件",
  "table.emptyDesc": "试试调整搜索关键词或筛选条件",
  "table.pagination": "共 {total} 条 · 第 {page} / {pages} 页",
  "table.perPage": "{size} 条/页",

  // 详情抽屉
  "detail.copied": "已复制",
  "detail.copy": "复制",
  "detail.curated": "精选插件",
  "detail.archived": "已归档",
  "detail.watchers": "关注",
  "detail.topics": "主题标签",
  "detail.created": "创建时间",
  "detail.updated": "最近更新",
  "detail.pushed": "最后推送",
  "detail.topicLabel": "话题",
  "detail.tags": "{n} 个标签",
  "detail.install": "安装命令（dsh 插件包）",
  "detail.installNote":
    "需声明 dsh.bundle 清单的插件包才可作为活动配置层；安装第三方插件会执行其代码，请自行审阅源码。",
  "detail.homepage": "主页",

  // 页脚
  "footer.sources": "数据来源",
  "footer.topic": "GitHub topic「dsh-plugin」",
  "footer.summary": "· 收录 {n} 个仓库 · 快照时间 {date}",
  "footer.disclaimer":
    "本看板由社区维护，收录不代表官方背书；插件由各自作者开发与维护，安装第三方插件会在本机执行其代码，请自行审阅源码并注意风险。与 DeepSeek 官方无关联。",
  "footer.categories": "分类参考",
  "footer.and": "与",
  "footer.curatedLists": "精选列表 · 数据构建：",

  // 图表
  "chart.donutTitle": "语言分布",
  "chart.donutSubtitle": "按仓库数量统计的开发语言",
  "chart.other": "其他",
  "chart.growthTitle": "插件增长趋势",
  "chart.growthSubtitle": "按创建时间统计的每月新增仓库（近 12 个月）",
  "chart.growthName": "新增插件",
  "chart.bucketsTitle": "Star 规模分布",
  "chart.bucketsSubtitle": "仓库按 Star 数量分层，呈长尾分布",
  "chart.bucketsName": "仓库数",
  "chart.bucketsMedian": "中位数 {n} 个 Star —— 绝大多数插件刚起步，头部效应明显",
  "chart.bucket4": "1k ~ 1 万",
  "chart.bucket5": "1 万+",
  "chart.topTitle": "Star 排行 Top 10",
  "chart.topSubtitle": "话题下最受欢迎的仓库",
  "chart.topFooter": "榜首 {name} · {n} ★",
  "chart.reposUnit": " 个",

  // 语言名
  "lang.unknown": "未知",
}

export type TKey = keyof typeof zh

const en: Record<TKey, string> = {
  "app.title": "DSH Plugin Dashboard · DeepSeek Harness Plugin Ecosystem",
  "app.heroTitle": "DeepSeek Harness Plugin Ecosystem",
  "app.heroDesc1":
    "DeepSeek Harness believes “everything is a plugin” — models, tools, sandboxes, session stores, UI, even the agent loop itself can be replaced and extended with plugins. This dashboard is built on the GitHub",
  "app.heroDesc2": "topic and community curated lists, aggregating plugin popularity, languages, categories and activity.",
  "app.categoryHeading": "Category Overview",
  "app.clearFilter": "Clear filter (current: {cat})",
  "app.pluginHeading": "Plugin List",
  "toast.refreshFail": "Refresh failed",
  "toast.refreshFailDesc": "GitHub API rate-limited or network unavailable; keeping current data.",
  "toast.refreshOk": "Data refreshed",
  "toast.refreshOkDesc": "Updated {n} repos · topic total {total}",

  "header.title": "DSH Plugin Dashboard",
  "header.badge": "DeepSeek Harness Plugin Ecosystem",
  "header.snapshot": "Data snapshot · {time}",
  "header.refreshing": " · Refreshing…",
  "header.visitorTitle": "GitHub Pages total visits (third-party counter, +1 per page load)",
  "header.visits": "Visits",
  "header.visitorAlt": "GitHub Pages visits",
  "header.refreshTitle": "Re-fetch dsh-plugin topic data from GitHub (Top 300)",
  "header.refresh": "Refresh",
  "header.toggleLight": "Switch to light mode",
  "header.toggleDark": "Switch to dark mode",
  "header.repoTitle": "Source code of this dashboard",
  "header.language": "Switch language",

  "stat.repos": "Repos in Topic",
  "stat.reposHint": "{n} repos on the GitHub dsh-plugin topic",
  "stat.curated": "Curated Plugins",
  "stat.curatedHint": "From community-maintained awesome lists",
  "stat.stars": "Total Stars",
  "stat.starsHint": "{n} avg",
  "stat.forks": "Total Forks",
  "stat.forksHint": "Community forks & collaboration",
  "stat.active": "Active in 30d",
  "stat.activeHint": "Repos with recent commits",
  "stat.langs": "Languages",
  "stat.langsHint": "A TypeScript-driven ecosystem",

  "cat.clearTitle": "Click to clear filter",
  "cat.filterTitle": "Filter by “{cat}”",
  "cat.percent": "{p}%",

  "table.searchPlaceholder": "Search name / author / description / topics…",
  "table.allCategories": "All categories",
  "table.catWithCount": "{cat} ({n})",
  "table.allLanguages": "All languages",
  "table.sort": "Sort",
  "table.sortStars": "By stars",
  "table.sortForks": "By forks",
  "table.sortUpdated": "By last updated",
  "table.sortCreated": "By created",
  "table.sortName": "By name",
  "table.sortAsc": "Ascending; click to switch to descending",
  "table.sortDesc": "Descending; click to switch to ascending",
  "table.curatedOnly": "Curated only",
  "table.headRepo": "Repository",
  "table.headCategory": "Category",
  "table.headLanguage": "Language",
  "table.headUpdated": "Last updated",
  "table.headActions": "Actions",
  "table.curatedAria": "Curated",
  "table.archived": "Archived",
  "table.viewDetail": "View details",
  "table.emptyTitle": "No matching plugins",
  "table.emptyDesc": "Try adjusting your search or filters",
  "table.pagination": "{total} items · Page {page} / {pages}",
  "table.perPage": "{size} / page",

  "detail.copied": "Copied",
  "detail.copy": "Copy",
  "detail.curated": "Curated",
  "detail.archived": "Archived",
  "detail.watchers": "Watchers",
  "detail.topics": "Topics",
  "detail.created": "Created",
  "detail.updated": "Last updated",
  "detail.pushed": "Last push",
  "detail.topicLabel": "Topics",
  "detail.tags": "{n} tags",
  "detail.install": "Install command (dsh plugin bundle)",
  "detail.installNote":
    "Only bundles declaring a dsh.bundle manifest can act as an active config layer; installing third-party plugins executes their code — review the source yourself.",
  "detail.homepage": "Homepage",

  "footer.sources": "Data sources",
  "footer.topic": "GitHub topic “dsh-plugin”",
  "footer.summary": "· {n} repos · snapshot {date}",
  "footer.disclaimer":
    "This dashboard is maintained by the community; inclusion does not imply official endorsement. Plugins are developed and maintained by their authors — installing a third-party plugin executes its code on your machine, so review the source and be aware of the risks. Not affiliated with DeepSeek.",
  "footer.categories": "Categories based on",
  "footer.and": "and",
  "footer.curatedLists": "curated lists · Data built with:",

  "chart.donutTitle": "Languages",
  "chart.donutSubtitle": "Top languages by repo count",
  "chart.other": "Other",
  "chart.growthTitle": "Plugin Growth",
  "chart.growthSubtitle": "New repos per month by creation time (last 12 months)",
  "chart.growthName": "New plugins",
  "chart.bucketsTitle": "Star Distribution",
  "chart.bucketsSubtitle": "Repos bucketed by star count — a long tail",
  "chart.bucketsName": "Repos",
  "chart.bucketsMedian": "Median {n} stars — most plugins are just getting started; a clear head effect",
  "chart.bucket4": "1k ~ 10k",
  "chart.bucket5": "10k+",
  "chart.topTitle": "Top 10 by Stars",
  "chart.topSubtitle": "Most popular repos in the topic",
  "chart.topFooter": "Top: {name} · {n} ★",
  "chart.reposUnit": "",

  "lang.unknown": "Unknown",
}

/** 数据分类（中文键）→ 英文显示名；未知分类回退原文 */
const CATEGORY_EN: Record<string, string> = {
  核心与官方: "Core & Official",
  "UI 增强": "UI Enhancements",
  会话与消息: "Sessions & Messages",
  工具与能力: "Tools & Capabilities",
  工作流与自动化: "Workflows & Automation",
  通知与集成: "Notifications & Integrations",
  开发与运行时: "Dev & Runtime",
  趣味: "Fun",
  精选列表: "Curated Lists",
  基础设施与开发: "Infrastructure & Development",
  其他: "Other",
}

/** 增长图月份标签 */
export const MONTHS: Record<Locale, string[]> = {
  zh: ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
}

export const THIS_MONTH: Record<Locale, string> = { zh: "本月", en: "This month" }

/** 本地化数字：zh 用 万/亿，en 用 k/M/B */
function fmtLocale(n: number, locale: Locale): string {
  if (locale === "zh") {
    if (n >= 1e8) return (n / 1e8).toFixed(2).replace(/\.?0+$/, "") + " 亿"
    if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, "") + " 万"
    return n.toLocaleString("zh-CN")
  }
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B"
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k"
  return n.toLocaleString("en-US")
}

/** 本地化相对时间 */
function timeAgoLocale(iso: string, locale: Locale): string {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return locale === "zh" ? "未知" : "Unknown"
  const diff = Date.now() - t
  const min = Math.floor(diff / 60_000)
  if (locale === "en") {
    if (min < 1) return "just now"
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}h ago`
    const day = Math.floor(hr / 24)
    if (day < 30) return `${day}d ago`
    const mon = Math.floor(day / 30)
    if (mon < 12) return `${mon}mo ago`
    return `${Math.floor(mon / 12)}y ago`
  }
  if (min < 1) return "刚刚"
  if (min < 60) return `${min} 分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} 小时前`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} 天前`
  const mon = Math.floor(day / 30)
  if (mon < 12) return `${mon} 个月前`
  return `${Math.floor(mon / 12)} 年前`
}

/** 本地化日期 */
function fmtDateLocale(iso: string, locale: Locale): string {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return "—"
  return d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: locale === "zh" ? "2-digit" : "short",
    day: "2-digit",
  })
}

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  isZh: boolean
  t: (key: TKey, vars?: Record<string, string | number>) => string
  fmt: (n: number) => string
  timeAgo: (iso: string) => string
  fmtDate: (iso: string) => string
  cat: (zhName: string) => string
  lang: (name: string) => string
  months: string[]
  thisMonth: string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(LS_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en"
    document.title = locale === "zh" ? zh["app.title"] : en["app.title"]
  }, [locale])

  const value: I18nContextValue = {
    locale,
    setLocale,
    isZh: locale === "zh",
    t: useCallback(
      (key: TKey, vars?: Record<string, string | number>) =>
        interpolate(locale === "zh" ? zh[key] : en[key], vars),
      [locale],
    ),
    fmt: useCallback((n: number) => fmtLocale(n, locale), [locale]),
    timeAgo: useCallback((iso: string) => timeAgoLocale(iso, locale), [locale]),
    fmtDate: useCallback((iso: string) => fmtDateLocale(iso, locale), [locale]),
    cat: useCallback(
      (zhName: string) => (locale === "zh" ? zhName : (CATEGORY_EN[zhName] ?? zhName)),
      [locale],
    ),
    lang: useCallback(
      (name: string) => (locale === "zh" ? name : name === "未知" ? "Unknown" : name),
      [locale],
    ),
    months: MONTHS[locale],
    thisMonth: THIS_MONTH[locale],
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
