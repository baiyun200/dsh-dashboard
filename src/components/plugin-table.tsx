import { useEffect, useMemo, useState } from "react"
import { ArrowDownUp, ChevronLeft, ChevronRight, Eye, Search, SearchX, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CATEGORY_BADGE, fmt, langColor, timeAgo } from "@/lib/data"
import { cn } from "@/lib/utils"
import type { Plugin } from "@/lib/types"

type SortKey = "stars" | "forks" | "updated" | "created" | "name"

interface PluginTableProps {
  plugins: Plugin[]
  categoryFilter: string
  onCategoryChange: (c: string) => void
  onOpenDetail: (p: Plugin) => void
  loading?: boolean
}

const PAGE_SIZES = [10, 20, 50]

export function PluginTable({ plugins, categoryFilter, onCategoryChange, onOpenDetail, loading }: PluginTableProps) {
  const [query, setQuery] = useState("")
  const [language, setLanguage] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("stars")
  const [asc, setAsc] = useState(false)
  const [curatedOnly, setCuratedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 外部分类筛选变化时回到第一页
  useEffect(() => {
    setPage(1)
  }, [categoryFilter, language, curatedOnly, query, sortKey, asc, pageSize])

  const languages = useMemo(() => {
    const s = new Set(plugins.map((p) => p.language))
    return [...s].sort((a, b) => a.localeCompare(b, "zh-CN"))
  }, [plugins])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = plugins
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter)
    if (language !== "all") list = list.filter((p) => p.language === language)
    if (curatedOnly) list = list.filter((p) => p.curated)
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.topics.some((t) => t.toLowerCase().includes(q)),
      )
    }
    const dir = asc ? 1 : -1
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name, "zh-CN") * dir
        case "created":
          return (+new Date(a.createdAt) - +new Date(b.createdAt)) * dir
        case "updated":
          return (+new Date(a.updatedAt) - +new Date(b.updatedAt)) * dir
        case "forks":
          return (a.forks - b.forks) * dir
        default:
          return (a.stars - b.stars) * dir
      }
    })
  }, [plugins, query, categoryFilter, language, curatedOnly, sortKey, asc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <div className="space-y-3">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索名称 / 作者 / 描述 / 主题标签…"
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter || "all"} onValueChange={(v) => onCategoryChange(v && v !== "all" ? v : "")}>
          <SelectTrigger className="h-8 w-36" size="sm">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {Object.entries(
              plugins.reduce<Record<string, number>>((acc, p) => {
                acc[p.category] = (acc[p.category] ?? 0) + 1
                return acc
              }, {}),
            )
              .sort((a, b) => b[1] - a[1])
              .map(([cat, n]) => (
                <SelectItem key={cat} value={cat}>
                  {cat}（{n}）
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select value={language} onValueChange={(v) => setLanguage(v ?? "all")}>
          <SelectTrigger className="h-8 w-32" size="sm">
            <SelectValue placeholder="全部语言" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部语言</SelectItem>
            {languages.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey((v ?? "stars") as SortKey)}>
          <SelectTrigger className="h-8 w-32" size="sm">
            <SelectValue placeholder="排序" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stars">按 Star</SelectItem>
            <SelectItem value="forks">按 Fork</SelectItem>
            <SelectItem value="updated">按最近更新</SelectItem>
            <SelectItem value="created">按创建时间</SelectItem>
            <SelectItem value="name">按名称</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setAsc(!asc)}
          title={asc ? "当前升序，点击切换降序" : "当前降序，点击切换升序"}
        >
          <ArrowDownUp className="h-3.5 w-3.5" />
        </Button>
        <label className="flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs text-muted-foreground">
          <Switch checked={curatedOnly} onCheckedChange={setCuratedOnly} />
          仅看精选
        </label>
      </div>

      {/* 表格 */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 text-center">#</TableHead>
              <TableHead>仓库</TableHead>
              <TableHead className="hidden lg:table-cell">分类</TableHead>
              <TableHead className="hidden md:table-cell">语言</TableHead>
              <TableHead className="text-right">Star</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Fork</TableHead>
              <TableHead className="hidden text-right sm:table-cell">最近更新</TableHead>
              <TableHead className="w-16 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.map((p) => {
                  const rank = filtered.indexOf(p) + 1
                  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null
                  return (
                    <TableRow key={p.id} className="cursor-pointer" onClick={() => onOpenDetail(p)}>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground tabular-nums">
                        {medal ?? rank}
                      </TableCell>
                      <TableCell className="max-w-72">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={`https://github.com/${p.owner}.png?size=40`}
                            alt={p.owner}
                            loading="lazy"
                            className="h-7 w-7 shrink-0 rounded-full border bg-muted"
                            onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="truncate font-medium">{p.name}</span>
                              {p.curated && (
                                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="精选" />
                              )}
                              {p.archived && (
                                <Badge variant="secondary" className="shrink-0 px-1 py-0 text-[10px]">
                                  已归档
                                </Badge>
                              )}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{p.owner}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className={cn("border", CATEGORY_BADGE[p.category] ?? "")}>
                          {p.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: langColor(p.language) }} />
                          {p.language}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{fmt(p.stars)}</TableCell>
                      <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                        {fmt(p.forks)}
                      </TableCell>
                      <TableCell className="hidden text-right text-xs text-muted-foreground sm:table-cell">
                        {timeAgo(p.pushedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenDetail(p)
                          }}
                          title="查看详情"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
        </Table>
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <SearchX className="h-8 w-8" />
            <p className="text-sm">没有找到匹配的插件</p>
            <p className="text-xs">试试调整搜索关键词或筛选条件</p>
          </div>
        )}
      </div>

      {/* 分页 */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          共 <span className="font-semibold text-foreground">{filtered.length}</span> 条 · 第{" "}
          <span className="font-semibold text-foreground">{safePage}</span> / {totalPages} 页
        </p>
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v ?? 20))}>
            <SelectTrigger className="h-7 w-20" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} 条/页
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon-sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
