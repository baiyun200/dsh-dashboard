import { Eye, Github, Languages, Moon, RefreshCw, Sun } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VISITOR_BADGE_URL } from "@/lib/data"
import { useI18n, type Locale } from "@/lib/i18n"
import { useTheme } from "@/lib/theme"

interface HeaderProps {
  fetchedAt: string
  refreshing: boolean
  onRefresh: () => void
}

const LOCALE_LABEL: Record<Locale, string> = { zh: "中文", en: "EN" }

export function Header({ fetchedAt, refreshing, onRefresh }: HeaderProps) {
  const { theme, toggle } = useTheme()
  const { locale, setLocale, t } = useI18n()
  const time = new Date(fetchedAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
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
            <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">{t("header.title")}</h1>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {t("header.badge")}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {t("header.snapshot", { time })}
            {refreshing ? t("header.refreshing") : ""}
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div
            className="hidden items-center gap-1.5 rounded-lg border bg-muted/40 px-2 py-1.5 lg:flex"
            title={t("header.visitorTitle")}
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t("header.visits")}</span>
            <img src={VISITOR_BADGE_URL} alt={t("header.visitorAlt")} className="h-5 w-auto" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="gap-1.5"
            title={t("header.refreshTitle")}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{t("header.refresh")}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              data-testid="lang-switch"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              title={t("header.language")}
            >
              <Languages className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{LOCALE_LABEL[locale]}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocale("zh")}>简体中文</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("en")}>English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={toggle} title={theme === "dark" ? t("header.toggleLight") : t("header.toggleDark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <a
            href="https://github.com/baiyun200/dsh-dashboard"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            title={t("header.repoTitle")}
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  )
}
