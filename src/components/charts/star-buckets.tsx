import { useMemo } from "react"
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartCard } from "./chart-card"
import { ChartTooltip } from "./chart-tooltip"
import type { Plugin } from "@/lib/types"

const BUCKETS = [
  { key: "1-9", label: "1 ~ 9" },
  { key: "10-99", label: "10 ~ 99" },
  { key: "100-999", label: "100 ~ 999" },
  { key: "1k-10k", label: "1k ~ 1 万" },
  { key: "10k+", label: "1 万+" },
]

const COLORS = ["var(--chart-5)", "var(--chart-3)", "var(--chart-2)", "var(--chart-1)", "#1d4ed8"]

/** Star 规模分布（长尾生态） */
export function StarBuckets({ plugins }: { plugins: Plugin[] }) {
  const data = useMemo(() => {
    const counts = BUCKETS.map((b) => ({ ...b, count: 0 }))
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
  }, [plugins])

  return (
    <ChartCard title="Star 规模分布" subtitle="仓库按 Star 数量分层，呈长尾分布" className="h-full">
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip unit=" 个" />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
            <Bar dataKey="count" name="仓库数" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        中位数 <span className="font-semibold text-foreground">2</span> 个 Star —— 绝大多数插件刚起步，头部效应明显
      </p>
    </ChartCard>
  )
}
