import { useMemo } from "react"
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartCard } from "./chart-card"
import { ChartTooltip } from "./chart-tooltip"
import { CATEGORY_COLOR, fmt } from "@/lib/data"
import type { Plugin } from "@/lib/types"

/** Star 排行 Top 10（横向条形图） */
export function TopStars({ plugins }: { plugins: Plugin[] }) {
  const data = useMemo(
    () =>
      [...plugins]
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 10)
        .map((p) => ({
          name: p.name.length > 16 ? p.name.slice(0, 15) + "…" : p.name,
          full: p.id,
          stars: p.stars,
          category: p.category,
        })),
    [plugins],
  )

  return (
    <ChartCard title="Star 排行 Top 10" subtitle="话题下最受欢迎的仓库" className="h-full">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, left: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.08)]} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<ChartTooltip unit=" ★" labelFormatter={(v) => String(v)} />}
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            />
            <Bar dataKey="stars" name="Star" radius={[0, 6, 6, 0]} maxBarSize={18}>
              {data.map((d) => (
                <Cell key={d.full} fill={CATEGORY_COLOR[d.category] ?? "var(--chart-1)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        榜首 <span className="font-semibold text-foreground">deepseek-harness</span> · {fmt(data[0]?.stars ?? 0)} ★
      </p>
    </ChartCard>
  )
}
