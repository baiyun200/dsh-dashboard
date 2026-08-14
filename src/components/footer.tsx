import { ExternalLink } from "lucide-react"

import { TOPIC_URL } from "@/lib/github"
import { useI18n } from "@/lib/i18n"

export function Footer({ fetchedAt, totalTopic }: { fetchedAt: string; totalTopic: number }) {
  const { t, locale } = useI18n()
  return (
    <footer className="mt-10 border-t bg-muted/30">
      <div className="mx-auto max-w-[1440px] space-y-3 px-4 py-6 text-xs leading-relaxed text-muted-foreground sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-medium text-foreground">{t("footer.sources")}</span>
          <a href={TOPIC_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
            {t("footer.topic")} <ExternalLink className="h-3 w-3" />
          </a>
          <span>
            {t("footer.summary", {
              n: totalTopic,
              date: new Date(fetchedAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US"),
            })}
          </span>
        </div>
        <p>{t("footer.disclaimer")}</p>
        <p>
          {t("footer.categories")}{" "}
          <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin" target="_blank" rel="noreferrer" className="hover:text-foreground">awesome-dsh-plugin</a>{" "}
          {t("footer.and")}{" "}
          <a href="https://github.com/0xsline/awesome-deepseek-harness" target="_blank" rel="noreferrer" className="hover:text-foreground">awesome-deepseek-harness</a>{" "}
          {t("footer.curatedLists")} <code className="font-mono">npm run data</code>
        </p>
      </div>
    </footer>
  )
}
