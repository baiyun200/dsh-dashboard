# DSH Plugin Dashboard

> **Language**: [English](README.md) · [简体中文](README.zh-CN.md)

A visualization dashboard for the **DeepSeek Harness plugin ecosystem**, built on the GitHub [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic.
Built with **shadcn/ui** + **Recharts** — bilingual (中文 / English) interface: stat cards, charts, category overview, and a searchable / filterable / sortable plugin table with a detail drawer. On first visit the language follows your browser; you can switch it anytime from the header.

> DeepSeek Harness: Everything is a Plugin. Models, tools, sandboxes, session stores, UI, even the agent loop itself can be replaced and extended with plugins.

## Preview

![DSH Plugin Dashboard](docs/screenshot.png)

## Live Site

- **GitHub Pages**: <https://baiyun200.github.io/dsh-dashboard/>　[![visitors](https://visitor-badge.laobi.icu/badge?page_id=baiyun200.dsh-dashboard)](https://baiyun200.github.io/dsh-dashboard/)
- Built and deployed daily by GitHub Actions: re-fetches the `dsh-plugin` topic at 01:30 UTC (09:30 Beijing time) and publishes; pushing to `main` or a manual trigger (Actions → 每日构建 & 部署 GitHub Pages → Run workflow) also redeploys.

## Features

- 👁️ **Visitor counter**: cumulative GitHub Pages visits shown in the top-right corner (third-party counter)
- 🌐 **Bilingual UI (中文/English)**: auto-detects your browser language on first visit; switch anytime from the header

- 📊 **Stat cards**: repos in topic, curated plugins, total stars/forks, active in 30 days, languages
- 📈 **Charts**:
  - Language distribution donut
  - Plugin growth trend (new repos per month, last 12 months)
  - Star size distribution (long-tail histogram)
  - Top 10 by stars
- 🗂️ **Category overview**: 11 categories following awesome-dsh-plugin / awesome-deepseek-harness; click to filter
- 🔍 **Plugin table**: search (name / author / description / topic tags), category & language filters, sorting, curated-only toggle, pagination
- 📋 **Detail drawer**: description, stats, topic tags, timeline, one-click copy of the install command
- 🔄 **Live refresh**: re-fetch topic data from the GitHub API (Top 300) in the browser, with graceful fallback on failure
- 🌓 **Light/dark theme**: dark by default, switchable and remembered

## Quick Start

```bash
npm install        # install dependencies
npm run dev        # dev server (Vite, http://localhost:5173)
npm run build      # type check + production build (dist/)
npm run preview    # preview the production build (http://localhost:4173)
```

## Data Pipeline

The built-in snapshot comes from `scripts/build-data.mjs`, fed by the GitHub API snapshots and curated lists under `data/raw/`:

```bash
bash scripts/fetch-data.sh   # re-fetch topic_page1-9.json + awesome README (rate-limit aware)
npm run data                 # normalize + categorize → src/data/plugins.json
```

The **Refresh** button in the top-right corner calls the GitHub API directly from the browser (cached in localStorage).

## Quality Checks

```bash
npm run preview    # start the preview first
node scripts/smoke-test.mjs   # end-to-end smoke tests with puppeteer-core + local Chrome
```

## Project Structure

```
src/
  components/
    charts/        # donut / growth trend / distribution histogram / ranking
    ui/            # shadcn/ui components (base-nova style)
    *.tsx          # header / stat cards / category overview / plugin table / detail drawer / footer
  data/plugins.json   # build output: 592+ repos + stats
  lib/             # types / data utils / GitHub live refresh / theme / i18n
scripts/
  build-data.mjs   # data build
  fetch-data.sh    # data fetching
  smoke-test.mjs   # end-to-end smoke tests
```

## Disclaimer

This dashboard is a community project, not affiliated with DeepSeek; inclusion does not imply official endorsement. Installing third-party plugins executes their code — review the source yourself.

## Star Growth Trend

![Star growth trend](docs/star-history.svg)
