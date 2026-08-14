#!/usr/bin/env node
/**
 * 生成仓库 Star 增长趋势图（docs/star-history.svg），供 README 展示。
 *
 * 数据源：GitHub stargazers 时间线 API（Accept: application/vnd.github.star+json）。
 * 该接口需要认证，CI 中使用 GITHUB_TOKEN；本地可用 gh auth token 兜底。
 * 仅适用于自己有权限的仓库（本仓库 baiyun200/dsh-dashboard）。
 *
 * 用法：GITHUB_TOKEN=xxx node scripts/star-history.mjs [owner/repo] [输出路径]
 */
import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(fileURLToPath(new URL("..", import.meta.url)))
const repo = process.argv[2] ?? "baiyun200/dsh-dashboard"
const outPath = process.argv[3] ?? join(root, "docs/star-history.svg")

function getToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  try {
    return execFileSync("gh", ["auth", "token"]).toString().trim()
  } catch {
    return null
  }
}

/** 分页拉取 stargazers 时间线 */
async function fetchStarTimeline(token) {
  const points = []
  let page = 1
  for (;;) {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/stargazers?per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github.star+json",
          "X-GitHub-Api-Version": "2022-11-28",
          Authorization: `Bearer ${token}`,
        },
      },
    )
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text().catch(() => "")}`)
    const items = await res.json()
    for (const item of items) points.push(item.starred_at)
    if (items.length < 100) break
    page++
  }
  return points
}

/** 累计曲线（按时间排序；每天取最后一个累计值） */
function buildSeries(starredAtList) {
  const sorted = [...starredAtList].sort()
  const series = []
  let count = 0
  let lastDay = null
  for (const iso of sorted) {
    count++
    const day = iso.slice(0, 10)
    if (day !== lastDay) {
      series.push({ day, count })
      lastDay = day
    }
  }
  // 超过 400 点则降采样
  if (series.length > 400) {
    const step = Math.ceil(series.length / 400)
    return series.filter((_, i) => i % step === 0)
  }
  return series
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** 手绘轻量 SVG 折线图 */
function renderSvg(series, total) {
  const W = 900
  const H = 320
  const P = { l: 56, r: 24, t: 34, b: 44 }
  const iw = W - P.l - P.r
  const ih = H - P.t - P.b
  const blue = "#2563eb"

  if (series.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <line x1="${P.l}" y1="${P.t}" x2="${P.l}" y2="${H - P.b}" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="${P.l}" y1="${H - P.b}" x2="${W - P.r}" y2="${H - P.b}" stroke="#e2e8f0" stroke-width="1"/>
  <text x="${W / 2}" y="${H / 2 - 10}" text-anchor="middle" font-size="15" fill="#64748b" font-family="sans-serif">该仓库还没有 Star —— 等第一颗星点亮曲线 ✦</text>
  <text x="${W / 2}" y="${H / 2 + 18}" text-anchor="middle" font-size="12" fill="#94a3b8" font-family="sans-serif">由 GitHub Actions 每日自动更新</text>
</svg>`
  }

  const max = Math.max(...series.map((p) => p.count), 1)
  const yAt = (v) => P.t + ih - (v / max) * ih

  // y 轴网格线与刻度（0 / 中值 / 最大值）
  const yTicks = [0, Math.round(max / 2), max]
  const yLabels = [...new Set(yTicks)]
  const yGrid = yLabels
    .map((v, i) => {
      const y = i === yLabels.length - 1 ? P.t : yAt(v)
      return `<line x1="${P.l}" y1="${y.toFixed(1)}" x2="${W - P.r}" y2="${y.toFixed(1)}" stroke="#f1f5f9" stroke-width="1"/>
<text x="${P.l - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#94a3b8" font-family="sans-serif">${v}</text>`
    })
    .join("\n")

  const first = series[0].day
  const last = series[series.length - 1].day

  // 只有 1 个数据点（首个 Star）：画一条平线 + 端点圆点，避免除零产生 NaN
  if (series.length === 1) {
    const y = yAt(series[0].count).toFixed(1)
    const xEnd = W - P.r
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  ${yGrid}
  <text x="${(P.l + iw / 2).toFixed(1)}" y="${H - P.b + 18}" text-anchor="middle" font-size="11" fill="#94a3b8" font-family="sans-serif">${first}</text>
  <path d="M${P.l},${y} L${xEnd},${y}" fill="none" stroke="${blue}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="${xEnd}" cy="${y}" r="4" fill="${blue}"/>
  <text x="${xEnd - 8}" y="${(yAt(series[0].count) - 10).toFixed(1)}" text-anchor="end" font-size="12" font-weight="600" fill="#1e293b" font-family="sans-serif">${total} ★</text>
  <text x="${P.l}" y="${20}" font-size="12" fill="#475569" font-family="sans-serif">${esc(repo)} · Star 增长趋势</text>
</svg>`
  }

  const xAt = (i) => P.l + (i / (series.length - 1)) * iw
  const path = series.map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(p.count).toFixed(1)}`).join(" ")
  const area = `${path} L${xAt(series.length - 1).toFixed(1)},${(H - P.b).toFixed(1)} L${P.l},${(H - P.b).toFixed(1)} Z`
  const mid = series[Math.floor(series.length / 2)].day
  const xTicks = [first, mid, last]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  ${yGrid}
  ${xTicks.map((d) => `<text x="${(d === first ? P.l : d === last ? W - P.r : P.l + iw / 2).toFixed(1)}" y="${H - P.b + 18}" text-anchor="middle" font-size="11" fill="#94a3b8" font-family="sans-serif">${d}</text>`).join("\n")}
  <path d="${area}" fill="${blue}" opacity="0.10"/>
  <path d="${path}" fill="none" stroke="${blue}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="${xAt(series.length - 1).toFixed(1)}" cy="${yAt(series[series.length - 1].count).toFixed(1)}" r="4" fill="${blue}"/>
  <text x="${xAt(series.length - 1) - 8}" y="${(yAt(series[series.length - 1].count) - 10).toFixed(1)}" text-anchor="end" font-size="12" font-weight="600" fill="#1e293b" font-family="sans-serif">${total} ★</text>
  <text x="${P.l}" y="${20}" font-size="12" fill="#475569" font-family="sans-serif">${esc(repo)} · Star 增长趋势</text>
</svg>`
}

const token = getToken()
if (!token) {
  console.error("未找到 GITHUB_TOKEN 或 gh auth token，跳过生成。")
  process.exit(0)
}

const starredAt = await fetchStarTimeline(token)
const series = buildSeries(starredAt)
const svg = renderSvg(series, starredAt.length)
writeFileSync(outPath, svg)
console.log(`✓ 已生成 ${outPath}：共 ${starredAt.length} 个 Star，${series.length} 个数据点`)
