import { ExternalLink } from "lucide-react"

import { TOPIC_URL } from "@/lib/github"

export function Footer({ fetchedAt, totalTopic }: { fetchedAt: string; totalTopic: number }) {
  return (
    <footer className="mt-10 border-t bg-muted/30">
      <div className="mx-auto max-w-[1440px] space-y-3 px-4 py-6 text-xs leading-relaxed text-muted-foreground sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-medium text-foreground">数据来源</span>
          <a href={TOPIC_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
            GitHub topic「dsh-plugin」<ExternalLink className="h-3 w-3" />
          </a>
          <span>· 收录 {totalTopic} 个仓库 · 快照时间 {new Date(fetchedAt).toLocaleString("zh-CN")}</span>
        </div>
        <p>
          本看板由社区维护，收录不代表官方背书；插件由各自作者开发与维护，安装第三方插件会在本机执行其代码，请自行审阅源码并注意风险。与 DeepSeek
          官方无关联。
        </p>
        <p>
          分类参考 <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin" target="_blank" rel="noreferrer" className="hover:text-foreground">awesome-dsh-plugin</a>{" "}
          与 <a href="https://github.com/0xsline/awesome-deepseek-harness" target="_blank" rel="noreferrer" className="hover:text-foreground">awesome-deepseek-harness</a>{" "}
          精选列表 · 数据构建：<code className="font-mono">npm run data</code>
        </p>
      </div>
    </footer>
  )
}
