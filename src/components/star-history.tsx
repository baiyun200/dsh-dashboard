import { useEffect, useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { starHistoryUrl } from "@/lib/data"

/**
 * Star 增长趋势图。
 * 数据源：star-history.com 免费 SVG API（支持 CORS）。
 * GitHub 已限制 Stargazer 时间线接口，部分仓库该服务无法提供数据，
 * 前端检测到限制提示后显示中文降级说明，并附完整历史链接。
 */
export function StarHistory({ repo }: { repo: string }) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading")
  const [src, setSrc] = useState("")

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    setState("loading")
    setSrc("")

    fetch(starHistoryUrl(repo))
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((svg) => {
        if (cancelled) return
        // 服务受限时返回的 SVG 内含提示文案
        if (svg.includes("restricted") || svg.includes("workaround")) {
          setState("error")
          return
        }
        objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
        setSrc(objectUrl)
        setState("ok")
      })
      .catch(() => {
        if (!cancelled) setState("error")
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [repo])

  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5" /> Star 增长趋势
      </p>
      <div className="overflow-hidden rounded-lg border bg-white">
        {state === "loading" && <Skeleton className="h-44 w-full rounded-none" />}
        {state === "ok" && src && (
          <img src={src} alt={`${repo} Star 历史`} className="h-auto w-full" loading="lazy" />
        )}
        {state === "error" && (
          <div className="flex flex-col items-center gap-1.5 px-4 py-6 text-center">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              暂无法获取该仓库的 Star 历史
              <br />
              （GitHub 已限制 Stargazer 时间线接口）
            </p>
            <a
              href={`https://star-history.com/#${repo}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              前往 star-history.com 查看完整历史 →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
