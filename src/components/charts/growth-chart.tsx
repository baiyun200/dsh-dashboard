import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartCard } from "./chart-card"
import { ChartTooltip } from "./chart-tooltip"
import type { Plugin } from "@/lib/types"

const MONTHS = ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"]

/** 插件增长趋势：按月新增数量（近 12 个月） */
export function GrowthChart({ plugins }: { plugins: Plugin[] }) {
  const data = useMemo(() => {
    const now = new Date()
    const buckets: Array<{ key: string; label: string; count: number }> = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const label = i === 0 ? "本月" : `${MONTHS[d.getMonth()]}`
      buckets.push({ key, label, count: 0 })
    }
    for (const p of plugins) {
      const key = p.createdAt.slice(0, 7)
      const b = buckets.find((x) => x.key === key)
      if (b) b.count++
    }
    return buckets.map((b, i) => ({ ...b, label: i === 0 ? b.label : b.label }))
  }, [plugins])

  return (
    <ChartCard title="插件增长趋势" subtitle="按创建时间统计的每月新增仓库（近 12 个月）" className="h-full">
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip unit=" 个" />} cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }} />
            <Area type="monotone" dataKey="count" name="新增插件" stroke="var(--chart-1)" strokeWidth={2} fill="url(#growthFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
