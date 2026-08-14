/**
 * 端到端冒烟测试：用本机 Chrome（headless）验证看板核心交互。
 * 用法：npm run preview 之后 node scripts/smoke-test.mjs
 */
import puppeteer from "puppeteer-core"

const URL = process.env.URL || "http://localhost:4173/"
const CHROME =
  process.env.CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

const results = []
function check(name, ok, extra = "") {
  results.push({ name, ok, extra })
  console.log(`${ok ? "✓" : "✗"} ${name}${extra ? " — " + extra : ""}`)
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  // --lang 在部分平台（macOS 系统语言）不生效，因此下面用 localStorage 显式固定中文，保证断言确定性
  args: ["--no-sandbox", "--disable-gpu", "--lang=zh-CN"],
  defaultViewport: { width: 1440, height: 2000 },
})

try {
  const page = await browser.newPage()
  page.on("pageerror", (err) => check("页面无 JS 错误", false, String(err).slice(0, 200)))
  page.on("console", (msg) => {
    if (msg.type() === "error") check("控制台无 error", false, msg.text().slice(0, 200))
  })

  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("dsh-dash-lang", "zh")
    } catch {
      /* 首个空白文档可能无 origin，忽略；站点文档会再次执行 */
    }
  })
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 30000 })
  await new Promise((r) => setTimeout(r, 1500))

  // 1. 标题与统计
  const title = await page.title()
  check("页面标题", title.includes("DSH 插件看板"), title)
  const statText = await page.evaluate(() => document.body.innerText)
  check("统计卡片：话题收录仓库", statText.includes("话题收录仓库"))
  check("统计卡片：累计 Star", statText.includes("累计 Star"))
  check("图表：语言分布", statText.includes("语言分布"))
  check("图表：Star 排行 Top 10", statText.includes("Star 排行 Top 10"))

  // 1b. 右上角 GitHub 链接指向本仓库
  const ghLink = await page.evaluate(() => {
    const a = [...document.querySelectorAll("header a")].find((x) => x.getAttribute("href")?.includes("github.com"))
    return a?.getAttribute("href") ?? null
  })
  check("右上角链接指向本仓库", ghLink === "https://github.com/baiyun200/dsh-dashboard", `实际 ${ghLink}`)

  // 1c. 访问量徽章
  const badge = await page.evaluate(() => {
    const img = [...document.querySelectorAll("header img")].find((x) => x.src?.includes("visitor-badge"))
    return img?.src ?? null
  })
  check("访问量徽章存在", !!badge, badge ?? "未找到")

  // 2. 表格行数（默认 20/页）
  const rowCount = await page.$$eval("table tbody tr", (rows) => rows.length)
  check("表格行数 = 20", rowCount === 20, `实际 ${rowCount}`)

  // 3. 搜索
  await page.type('input[placeholder*="搜索"]', "tui")
  await new Promise((r) => setTimeout(r, 600))
  const searchRows = await page.$$eval("table tbody tr", (rows) => rows.length)
  const bodyText = await page.evaluate(() => document.body.innerText)
  check("搜索 tui 有结果", searchRows > 0 && bodyText.includes("tui"), `行数 ${searchRows}`)
  await page.click('input[placeholder*="搜索"]', { clickCount: 3 })
  await page.keyboard.press("Backspace")

  // 4. 分类筛选：点击「UI 增强」分类卡片
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")]
    const target = btns.find((b) => b.textContent?.includes("UI 增强"))
    if (target) {
      target.click()
      return true
    }
    return false
  })
  check("点击「UI 增强」分类卡片", clicked)
  await new Promise((r) => setTimeout(r, 600))
  const uiBody = await page.evaluate(() => document.body.innerText)
  check("筛选后显示清除筛选入口", uiBody.includes("清除筛选"))
  const uiRows = await page.$$eval("table tbody tr", (rows) => rows.length)
  check("筛选后有结果行", uiRows > 0, `行数 ${uiRows}`)

  // 5. 详情抽屉：点击第一行
  await page.$$eval("table tbody tr", (rows) => rows[0]?.click())
  await new Promise((r) => setTimeout(r, 1200))
  const detailText = await page.evaluate(() => document.body.innerText)
  check("详情抽屉打开（含安装命令）", detailText.includes("安装命令") && detailText.includes("GitHub"))
  check("详情抽屉显示统计数据", detailText.includes("Star") && detailText.includes("Fork"))

  // 5b. 详情抽屉过长时可滚动（回归：过长时曾无滚动条，底部内容被截断）
  await page.setViewport({ width: 1440, height: 500 })
  await new Promise((r) => setTimeout(r, 400))
  const drawerScroll = await page.evaluate(() => {
    const vp = document.querySelector('[data-slot="scroll-area-viewport"]')
    const popup = document.querySelector('[data-slot="sheet-content"]')
    return {
      scrollable: vp ? vp.scrollHeight > vp.clientHeight : false,
      noPopupOverflow: popup ? popup.scrollHeight <= popup.clientHeight + 1 : false,
    }
  })
  check("详情抽屉过长时可滚动", drawerScroll.scrollable && drawerScroll.noPopupOverflow, JSON.stringify(drawerScroll))
  await page.setViewport({ width: 1440, height: 2000 })

  // 关闭抽屉
  await page.keyboard.press("Escape")
  await new Promise((r) => setTimeout(r, 500))

  // 6. 主题切换
  const darkBefore = await page.evaluate(() => document.documentElement.classList.contains("dark"))
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.title?.includes("切换浅色模式") || b.title?.includes("切换深色模式"))
    btn?.click()
  })
  await new Promise((r) => setTimeout(r, 400))
  const darkAfter = await page.evaluate(() => document.documentElement.classList.contains("dark"))
  check("主题切换生效", darkBefore !== darkAfter, `dark: ${darkBefore} → ${darkAfter}`)

  // 7. 刷新按钮：数量只增不减，且有 toast 反馈
  const countBefore = await page.evaluate(() => {
    const label = [...document.querySelectorAll("p")].find((p) => p.textContent === "话题收录仓库")
    const value = label?.parentElement?.querySelectorAll("p")[1]
    return value ? parseInt(value.textContent.replace(/,/g, ""), 10) : null
  })
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("刷新数据"))
    btn?.click()
  })
  // sonner toast 约 4s 自动消失，轮询捕捉；9 页顺序抓取在线上浏览器约需 20-30s
  let toastSeen = false
  let countAfter = countBefore
  for (let i = 0; i < 110; i++) {
    const t = await page.evaluate(() => document.body.innerText)
    if (t.includes("数据已刷新") || t.includes("刷新失败")) toastSeen = true
    countAfter = await page.evaluate(() => {
      const label = [...document.querySelectorAll("p")].find((p) => p.textContent === "话题收录仓库")
      const value = label?.parentElement?.querySelectorAll("p")[1]
      return value ? parseInt(value.textContent.replace(/,/g, ""), 10) : null
    })
    if ((toastSeen && countAfter !== countBefore) || countAfter !== countBefore) break
    await new Promise((r) => setTimeout(r, 500))
  }
  check("刷新后有反馈（toast 或数据更新）", toastSeen)
  check(
    "刷新后仓库数量只增不减",
    countAfter !== null && countAfter >= (countBefore ?? 0),
    `刷新前 ${countBefore} → 刷新后 ${countAfter}`,
  )

  // 8. 中英文切换：右上角语言按钮 → English，界面切换为英文
  await page.evaluate(() => {
    document.querySelector('[data-testid="lang-switch"]')?.click()
  })
  await new Promise((r) => setTimeout(r, 400))
  await page.evaluate(() => {
    const item = [...document.querySelectorAll('[data-slot="dropdown-menu-item"]')].find(
      (i) => i.textContent?.trim() === "English",
    )
    item?.click()
  })
  await new Promise((r) => setTimeout(r, 600))
  const enText = await page.evaluate(() => document.body.innerText)
  const enTitle = await page.title()
  check("切换到英文界面", enText.includes("Plugin Dashboard") && enText.includes("Refresh"), `标题: ${enTitle}`)
  check("英文下分类显示英文名", enText.includes("Core & Official") || enText.includes("UI Enhancements"))
  // 切回中文
  await page.evaluate(() => {
    document.querySelector('[data-testid="lang-switch"]')?.click()
  })
  await new Promise((r) => setTimeout(r, 400))
  await page.evaluate(() => {
    const item = [...document.querySelectorAll('[data-slot="dropdown-menu-item"]')].find(
      (i) => i.textContent?.trim() === "简体中文",
    )
    item?.click()
  })
  await new Promise((r) => setTimeout(r, 600))
  const zhBack = await page.evaluate(() => document.body.innerText)
  check("切回中文界面", zhBack.includes("话题收录仓库"), "")
} catch (err) {
  check("测试执行异常", false, String(err).slice(0, 300))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n结果：${results.length - failed.length}/${results.length} 通过`)
process.exit(failed.length > 0 ? 1 : 0)
