import { Activity, Boxes, GitFork, Languages, Sparkles, Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { fmt } from "@/lib/data"
import type { Stats } from "@/lib/types"

const icons = {
  box: Boxes,
  star: Star,
  fork: GitFork,
  active: Activity,
  lang: Languages,
  curated: Sparkles,
}

interface StatCardsProps {
  stats: Stats
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      icon: "box" as const,
      label: "话题收录仓库",
      value: fmt(stats.fetched),
      hint: `GitHub dsh-plugin 话题共 ${fmt(stats.totalTopic)} 个`,
      accent: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: "curated" as const,
      label: "精选插件",
      value: fmt(stats.curated),
      hint: "来自社区维护的 awesome 列表",
      accent: "text-violet-500 bg-violet-500/10",
    },
    {
      icon: "star" as const,
      label: "累计 Star",
      value: fmt(stats.totalStars),
      hint: `均分 ${fmt(Math.round(stats.totalStars / stats.fetched))}`,
      accent: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: "fork" as const,
      label: "累计 Fork",
      value: fmt(stats.totalForks),
      hint: "社区复刻与协作",
      accent: "text-emerald-500 bg-emerald-500/10",
    },
    {
      icon: "active" as const,
      label: "近 30 天活跃",
      value: fmt(stats.active30d),
      hint: "有最新提交的仓库",
      accent: "text-cyan-500 bg-cyan-500/10",
    },
    {
      icon: "lang" as const,
      label: "开发语言",
      value: fmt(stats.languages),
      hint: "TypeScript 主导的生态",
      accent: "text-rose-500 bg-rose-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => {
        const Icon = icons[c.icon]
        return (
          <Card key={c.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{c.label}</p>
                  <p className="mt-1.5 text-2xl font-bold tracking-tight tabular-nums">{c.value}</p>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground/80">{c.hint}</p>
                </div>
                <div className={`shrink-0 rounded-lg p-2 ${c.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
