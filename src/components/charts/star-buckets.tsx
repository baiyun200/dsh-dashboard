import { useMemo } from "react"
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartCard } from "./chart-card"
import { ChartTooltip } from "./chart-tooltip"
import { useI18n } from "@/lib/i18n"
import type { Plugin } from "@/lib/types"

const BUCKETS: Array<{ key: string; label: string; labelKey?: "chart.bucket4" | "chart.bucket5" }> = [
  { key: "1-9", label: "1 ~ 9" },
  { key: "10-99", label: "10 ~ 99" },
  { key: "100-999", label: "100 ~ 999" },
  { key: "1k-10k", labelKey: "chart.bucket4", label: "1k ~ 1 万" },
  { key: "10k+", labelKey: "chart.bucket5", label: "1 万+" },
]

const COLORS = ["var(--chart-5)", "var(--chart-3)", "var(--chart-2)", "var(--chart-1)", "#1d4ed8"]

/** Star 规模分布（长尾生态） */
export function StarBuckets({ plugins }: { plugins: Plugin[] }) {
  const { t } = useI18n()
  const data = useMemo(() => {
    const counts = BUCKETS.map((b) => ({ ...b, label: b.labelKey ? t(b.labelKey) : b.label, count: 0 }))
    for (const p of plugins) {
      const s = p.stars
      let idx = 0
      if (s >= 10 && s < 100) idx = 1
      else if (s >= 100 && s < 1000) idx = 2
      else if (s >= 1000 && s < 10000) idx = 3
      else if (s >= 10000) idx = 4
      counts[idx].count++
    }
    return counts
  }, [plugins, t])

  return (
    <ChartCard title={t("chart.bucketsTitle")} subtitle={t("chart.bucketsSubtitle")} className="h-full">
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip unit={t("chart.reposUnit")} />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
            <Bar dataKey="count" name={t("chart.bucketsName")} radius={[6, 6, 0, 0]} maxBarSize={56}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("chart.bucketsMedian", { n: 2 })}
      </p>
    </ChartCard>
  )
}
