import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { Stats } from "@/lib/types"

const CATEGORY_ICONS: Record<string, string> = {
  核心与官方: "🐋",
  "UI 增强": "🎨",
  会话与消息: "💬",
  工具与能力: "🛠️",
  工作流与自动化: "⚙️",
  通知与集成: "🔔",
  开发与运行时: "🧩",
  趣味: "🎮",
  精选列表: "⭐",
  基础设施与开发: "🏗️",
  其他: "📦",
}

interface CategoryOverviewProps {
  stats: Stats
  selected: string
  onSelect: (cat: string) => void
}

/** 分类总览：点击可筛选插件列表 */
export function CategoryOverview({ stats, selected, onSelect }: CategoryOverviewProps) {
  const { t, cat } = useI18n()
  const total = stats.fetched || 1
  const entries = Object.entries(stats.categories).sort((a, b) => b[1] - a[1])

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {entries.map(([c, count]) => {
        const active = selected === c
        const label = cat(c)
        return (
          <button
            key={c}
            onClick={() => onSelect(active ? "" : c)}
            className={cn(
              "group relative overflow-hidden rounded-xl border bg-card p-3 text-left transition-all",
              active
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/40 hover:bg-accent/40",
            )}
            title={active ? t("cat.clearTitle") : t("cat.filterTitle", { cat: label })}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">{CATEGORY_ICONS[c] ?? "📦"}</span>
              <span className="truncate text-xs font-medium">{label}</span>
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums">{count}</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full bg-primary/70 transition-all", active && "bg-primary")}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("cat.percent", { p: ((count / total) * 100).toFixed(1) })}
            </p>
          </button>
        )
      })}
    </div>
  )
}
