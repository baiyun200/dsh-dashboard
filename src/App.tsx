import { useCallback, useMemo, useState } from "react"
import { Toaster, toast } from "sonner"

import { GrowthChart } from "@/components/charts/growth-chart"
import { LanguageDonut } from "@/components/charts/language-donut"
import { StarBuckets } from "@/components/charts/star-buckets"
import { TopStars } from "@/components/charts/top-stars"
import { CategoryOverview } from "@/components/category-overview"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { PluginDetail } from "@/components/plugin-detail"
import { PluginTable } from "@/components/plugin-table"
import { StatCards } from "@/components/stat-cards"
import { snapshot } from "@/lib/data"
import { fetchTopicRepos } from "@/lib/github"
import { I18nProvider, useI18n } from "@/lib/i18n"
import { ThemeProvider, useTheme } from "@/lib/theme"
import type { DashboardData, Plugin, Stats } from "@/lib/types"

const LS_KEY = "dsh-dash-live"

/** 尝试使用 localStorage 中较新的实时快照，否则用内置快照 */
function initialData(): DashboardData {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DashboardData
      if (parsed?.plugins?.length && new Date(parsed.meta.fetchedAt) > new Date(snapshot.meta.fetchedAt)) {
        return parsed
      }
    }
  } catch {
    /* ignore */
  }
  return snapshot
}

function Dashboard() {
  const { theme } = useTheme()
  const { t } = useI18n()
  const [data, setData] = useState<DashboardData>(initialData)
  const [category, setCategory] = useState("")
  const [selected, setSelected] = useState<Plugin | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    // 以当前展示的数据为基准合并，刷新后仓库数量只增不减
    const result = await fetchTopicRepos(data.plugins)
    setRefreshing(false)
    if (!result) {
      toast.error(t("toast.refreshFail"), {
        description: t("toast.refreshFailDesc"),
      })
      return
    }
    const next: DashboardData = {
      meta: { ...snapshot.meta, fetchedAt: result.fetchedAt, topic: "dsh-plugin" },
      stats: result.stats as Stats,
      plugins: result.plugins,
    }
    setData(next)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
    toast.success(t("toast.refreshOk"), {
      description: t("toast.refreshOkDesc", { n: result.plugins.length, total: result.totalTopic }),
    })
  }, [data, t])

  const stats = useMemo(() => data.stats, [data.stats])
  const plugins = useMemo(() => data.plugins, [data.plugins])

  return (
    <div className="min-h-screen bg-background">
      <Header fetchedAt={data.meta.fetchedAt} refreshing={refreshing} onRefresh={handleRefresh} />

      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6">
        {/* 简介 */}
        <section>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("app.heroTitle")}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t("app.heroDesc1")}{" "}
            <a href="https://github.com/topics/dsh-plugin" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
              dsh-plugin
            </a>{" "}
            {t("app.heroDesc2")}
          </p>
        </section>

        {/* 统计卡片 */}
        <StatCards stats={stats} />

        {/* 图表区 */}
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <LanguageDonut plugins={plugins} />
          <GrowthChart plugins={plugins} />
          <StarBuckets plugins={plugins} />
          <TopStars plugins={plugins} />
        </section>

        {/* 分类总览 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("app.categoryHeading")}</h3>
            {category && (
              <button
                onClick={() => setCategory("")}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t("app.clearFilter", { cat: category })}
              </button>
            )}
          </div>
          <CategoryOverview stats={stats} selected={category} onSelect={setCategory} />
        </section>

        {/* 插件列表 */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">{t("app.pluginHeading")}</h3>
          <PluginTable
            plugins={plugins}
            categoryFilter={category}
            onCategoryChange={setCategory}
            onOpenDetail={setSelected}
            loading={refreshing}
          />
        </section>
      </main>

      <Footer fetchedAt={data.meta.fetchedAt} totalTopic={stats.totalTopic} />
      <PluginDetail plugin={selected} onOpenChange={(open) => !open && setSelected(null)} />
      <Toaster theme={theme} richColors position="top-center" />
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    </I18nProvider>
  )
}
