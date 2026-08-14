#!/usr/bin/env bash
# 重新抓取 GitHub `dsh-plugin` 话题快照（搜索 API 未认证限额 10 次/分钟，共 9 页）
# 用法：bash scripts/fetch-data.sh
# 说明：抓取失败不中断（限流/网络波动时容忍部分页缺失），build-data 会跳过缺失页。
cd "$(dirname "$0")/.."
mkdir -p data/raw

ok=0
for page in 1 2 3 4 5 6 7 8 9; do
  out="data/raw/topic_page${page}.json"
  if curl -sf "https://api.github.com/search/repositories?q=topic:dsh-plugin&sort=stars&order=desc&per_page=100&page=${page}" \
    -H "Accept: application/vnd.github+json" -o "$out"; then
    echo "✓ page ${page} → ${out}"
    ok=$((ok + 1))
  else
    echo "⚠️ page ${page} 抓取失败（跳过）"
    rm -f "$out"
  fi
  sleep 8  # 限流保护
done

# 同步精选列表（可选，失败忽略）
curl -sf "https://raw.githubusercontent.com/awesome-dsh-plugin/awesome-dsh-plugin/main/README.md" -o data/raw/awesome_dsh_plugin.md || true
curl -sf "https://raw.githubusercontent.com/0xsline/awesome-deepseek-harness/main/README.md" -o data/raw/awesome_dsh_harness.md || true

if [ "$ok" -eq 0 ]; then
  echo "全部页面抓取失败，请检查网络或稍后重试。" >&2
  exit 1
fi
echo "完成（成功 ${ok}/9）。运行 npm run data 重新生成 src/data/plugins.json"
