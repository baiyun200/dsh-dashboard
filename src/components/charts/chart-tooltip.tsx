import { fmt } from "@/lib/data"

interface TooltipEntry {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string | number
  payload?: Record<string, unknown>
}

/** recharts 通用中文提示框 */
export function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
  labelFormatter,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  unit?: string
  labelFormatter?: (v: string | number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label !== undefined && label !== "" ? (
        <p className="mb-1 font-medium text-foreground">{labelFormatter ? labelFormatter(label) : label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto pl-4 font-semibold tabular-nums">
              {fmt(Number(entry.value))}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
