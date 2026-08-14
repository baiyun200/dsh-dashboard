import { Eye, Github, Moon, RefreshCw, Sun } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { VISITOR_BADGE_URL } from "@/lib/data"
import { useTheme } from "@/lib/theme"

interface HeaderProps {
  fetchedAt: string
  refreshing: boolean
  onRefresh: () => void
}

export function Header({ fetchedAt, refreshing, onRefresh }: HeaderProps) {
  const { theme, toggle } = useTheme()
  const time = new Date(fetchedAt).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
        <img
          src={`${import.meta.env.BASE_URL}whale.svg`}
          alt="DeepSeek Harness"
          className="h-9 w-9 shrink-0 rounded-lg"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">DSH 插件看板</h1>
            <Badge variant="outline" className="hidden sm:inline-flex">
              DeepSeek Harness 插件生态
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            数据快照 · {time}
            {refreshing ? " · 刷新中…" : ""}
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div
            className="hidden items-center gap-1.5 rounded-lg border bg-muted/40 px-2 py-1.5 lg:flex"
            title="GitHub Pages 累计访问量（第三方计数服务，每次页面加载 +1）"
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">访问量</span>
            <img src={VISITOR_BADGE_URL} alt="GitHub Pages 访问量" className="h-5 w-auto" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="gap-1.5"
            title="从 GitHub 重新拉取 dsh-plugin 话题数据（Top 300）"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">刷新数据</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} title={theme === "dark" ? "切换浅色模式" : "切换深色模式"}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <a
            href="https://github.com/baiyun200/dsh-dashboard"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            title="本看板源码仓库"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  )
}
