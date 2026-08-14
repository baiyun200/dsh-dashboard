import { useState } from "react"
import { Check, Copy, ExternalLink, Globe, Terminal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CATEGORY_BADGE, installCommand, langColor } from "@/lib/data"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { Plugin } from "@/lib/types"

interface PluginDetailProps {
  plugin: Plugin | null
  onOpenChange: (open: boolean) => void
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t("detail.copied") : label}
    </Button>
  )
}

export function PluginDetail({ plugin, onOpenChange }: PluginDetailProps) {
  const { t, fmt, fmtDate, timeAgo, cat, lang } = useI18n()
  return (
    <Sheet open={!!plugin} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        {plugin ? (
          <>
            <SheetHeader className="border-b px-5 py-4">
              <div className="flex items-start gap-3 pr-8">
                <img
                  src={`https://github.com/${plugin.owner}.png?size=80`}
                  alt={plugin.owner}
                  className="h-11 w-11 shrink-0 rounded-xl border bg-muted"
                  onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")}
                />
                <div className="min-w-0">
                  <SheetTitle className="break-all text-base">{plugin.name}</SheetTitle>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{plugin.owner}</p>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-5 px-5 py-4">
                {/* 描述 */}
                {plugin.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{plugin.description}</p>
                )}

                {/* 徽章 */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={cn("border", CATEGORY_BADGE[plugin.category] ?? "")}>
                    {cat(plugin.category)}
                  </Badge>
                  {plugin.curated && (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">{t("detail.curated")}</Badge>
                  )}
                  {plugin.archived && <Badge variant="secondary">{t("detail.archived")}</Badge>}
                  {plugin.isFork && <Badge variant="secondary">Fork</Badge>}
                  {plugin.language !== "未知" && (
                    <Badge variant="outline" className="border">
                      <span className="mr-1 h-2 w-2 rounded-full" style={{ background: langColor(plugin.language) }} />
                      {lang(plugin.language)}
                    </Badge>
                  )}
                  {plugin.license && <Badge variant="outline">{plugin.license}</Badge>}
                </div>

                {/* 统计数据 */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Star", value: fmt(plugin.stars) },
                    { label: "Fork", value: fmt(plugin.forks) },
                    { label: "Issue", value: fmt(plugin.issues) },
                    { label: t("detail.watchers"), value: fmt(plugin.watchers) },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border bg-muted/30 px-2 py-2 text-center">
                      <p className="text-sm font-bold tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* 主题标签 */}
                {plugin.topics.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("detail.topics")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {plugin.topics.map((topic) => (
                        <a
                          key={topic}
                          href={`https://github.com/topics/${topic}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        >
                          {topic}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* 信息 */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                  <div>
                    <dt className="text-muted-foreground">{t("detail.created")}</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">{fmtDate(plugin.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("detail.updated")}</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">{timeAgo(plugin.updatedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("detail.pushed")}</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">{timeAgo(plugin.pushedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("detail.topicLabel")}</dt>
                    <dd className="mt-0.5 font-medium">{t("detail.tags", { n: plugin.topics.length })}</dd>
                  </div>
                </dl>

                <Separator />

                {/* 安装命令 */}
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Terminal className="h-3.5 w-3.5" /> {t("detail.install")}
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                    <code className="min-w-0 flex-1 truncate font-mono text-xs">{installCommand(plugin)}</code>
                    <CopyButton text={installCommand(plugin)} label={t("detail.copy")} />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{t("detail.installNote")}</p>
                </div>
              </div>
            </ScrollArea>

            {/* 底部操作 */}
            <div className="flex gap-2 border-t px-5 py-3">
              <a
                href={plugin.url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1 gap-1.5" })}
              >
                <ExternalLink className="h-3.5 w-3.5" /> GitHub
              </a>
              {plugin.homepage && (
                <a
                  href={plugin.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1 gap-1.5" })}
                >
                  <Globe className="h-3.5 w-3.5" /> {t("detail.homepage")}
                </a>
              )}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
