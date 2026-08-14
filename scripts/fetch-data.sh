#!/usr/bin/env bash
# 重新抓取 GitHub `dsh-plugin` 话题快照（搜索 API 未认证限额 10 次/分钟，共 9 页）
# 用法：bash scripts/fetch-data.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p data/raw

for page in 1 2 3 4 5 6 7 8 9; do
  out="data/raw/topic_page${page}.json"
  curl -sf "https://api.github.com/search/repositories?q=topic:dsh-plugin&sort=stars&order=desc&per_page=100&page=${page}" \
    -H "Accept: application/vnd.github+json" -o "$out"
  echo "✓ page ${page} → ${out}"
  sleep 8  # 限流保护
done

# 同步精选列表（可选）
curl -sf "https://raw.githubusercontent.com/awesome-dsh-plugin/awesome-dsh-plugin/main/README.md" -o data/raw/awesome_dsh_plugin.md || true
curl -sf "https://raw.githubusercontent.com/0xsline/awesome-deepseek-harness/main/README.md" -o data/raw/awesome_dsh_harness.md || true

echo "完成。运行 npm run data 重新生成 src/data/plugins.json"
