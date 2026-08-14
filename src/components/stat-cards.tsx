import { Activity, Boxes, GitFork, Languages, Sparkles, Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
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
  const { t, fmt } = useI18n()
  const cards = [
    {
      icon: "box" as const,
      label: t("stat.repos"),
      value: fmt(stats.fetched),
      hint: t("stat.reposHint", { n: fmt(stats.totalTopic) }),
      accent: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: "curated" as const,
      label: t("stat.curated"),
      value: fmt(stats.curated),
      hint: t("stat.curatedHint"),
      accent: "text-violet-500 bg-violet-500/10",
    },
    {
      icon: "star" as const,
      label: t("stat.stars"),
      value: fmt(stats.totalStars),
      hint: t("stat.starsHint", { n: fmt(Math.round(stats.totalStars / stats.fetched)) }),
      accent: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: "fork" as const,
      label: t("stat.forks"),
      value: fmt(stats.totalForks),
      hint: t("stat.forksHint"),
      accent: "text-emerald-500 bg-emerald-500/10",
    },
    {
      icon: "active" as const,
      label: t("stat.active"),
      value: fmt(stats.active30d),
      hint: t("stat.activeHint"),
      accent: "text-cyan-500 bg-cyan-500/10",
    },
    {
      icon: "lang" as const,
      label: t("stat.langs"),
      value: fmt(stats.languages),
      hint: t("stat.langsHint"),
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
