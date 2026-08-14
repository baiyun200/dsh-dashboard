import { useMemo } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { ChartCard } from "./chart-card"
import { ChartTooltip } from "./chart-tooltip"
import type { Plugin } from "@/lib/types"

const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "#e11d48", "#ec4899", "#0d9488", "#ea580c", "#a1a1aa"]

/** 语言分布环形图 */
export function LanguageDonut({ plugins }: { plugins: Plugin[] }) {
  const data = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of plugins) counts.set(p.language, (counts.get(p.language) ?? 0) + 1)
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
    const top = sorted.slice(0, 8)
    const rest = sorted.slice(8).reduce((s, [, c]) => s + c, 0)
    const rows = top.map(([name, count]) => ({ name, count }))
    if (rest > 0) rows.push({ name: "其他", count: rest })
    return rows
  }, [plugins])

  return (
    <ChartCard title="语言分布" subtitle="按仓库数量统计的开发语言" className="h-full">
      <div className="flex h-[240px] items-center gap-2">
        <ResponsiveContainer width="55%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2} strokeWidth={0}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip unit=" 个" />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="min-w-0 flex-1 space-y-1.5">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="truncate text-muted-foreground">{d.name}</span>
              <span className="ml-auto shrink-0 font-medium tabular-nums">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {data.slice(0, 5).map((d, i) => (
          <span key={d.name} className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            {d.name} · {Math.round((d.count / plugins.length) * 100)}%
          </span>
        ))}
      </div>
    </ChartCard>
  )
}
