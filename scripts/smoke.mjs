import puppeteer from 'puppeteer-core'

const EXEC = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.env.SMOKE_URL || 'http://127.0.0.1:4173/'

let pass = 0
let fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) {
    pass++
    console.log('  PASS  ' + name)
  } else {
    fail++
    console.log('  FAIL  ' + name + (extra ? '  ::  ' + extra : ''))
  }
}

const browser = await puppeteer.launch({
  executablePath: EXEC,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })

const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text())
})
page.on('dialog', (d) => d.accept())

const clickByText = async (sel, text) => {
  const handles = await page.$$(sel)
  for (const h of handles) {
    const t = await page.evaluate((el) => (el.textContent || '').trim(), h)
    if (t.includes(text)) {
      await h.click()
      return true
    }
  }
  return false
}

const store = () =>
  page.evaluate(() => {
    const raw = localStorage.getItem('seedbank-v1')
    if (!raw) return { cards: [], drafts: [] }
    try {
      return JSON.parse(raw).state || { cards: [], drafts: [] }
    } catch {
      return { cards: [], drafts: [] }
    }
  })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

console.log('\n=== 种子库冒烟测试 ===\n')

await page.goto(URL, { waitUntil: 'networkidle2' })
await sleep(300)

// 1 渲染
const rootKids = await page.evaluate(() => document.getElementById('root')?.childElementCount || 0)
ok('页面渲染非空（无白屏）', rootKids > 0, 'root children = ' + rootKids)
ok('标题为种子库', (await page.title()).includes('种子库'))

// 2 速记
await page.click('.capture-input')
await page.type('.capture-input', '测试灵感：机器人学会了等待')
await clickByText('.primary-btn', '存进去')
await sleep(200)
let s = await store()
ok('速记能存入卡片', s.cards.length === 1, 'cards = ' + s.cards.length)
ok('速记自动取首行为标题', s.cards[0]?.title === '测试灵感：机器人学会了等待')
ok('速记后输入框清空', (await page.$eval('.capture-input', (el) => el.value)) === '')

// 3 卡片：新建 + 双向链接
await clickByText('.tab', '卡片')
await sleep(150)
await clickByText('.primary-btn', '新卡片')
await sleep(150)
await page.type('.title-input', '掉电顺序')
const body = await page.$('.body-input')
await body.type('先是 [[气味]]，然后是声音。')
await sleep(250)
s = await store()
ok('新建卡片成功', s.cards.length === 2)
ok('正文含链接被保存', (s.cards.find((c) => c.title === '掉电顺序')?.body || '').includes('[[气味]]'))

// 点链接 → 自动建卡
await page.click('.preview .link-chip')
await sleep(250)
s = await store()
ok('点击缺失链接会自动建卡', s.cards.length === 3)
ok('自动建的卡标题正确', s.cards.some((c) => c.title === '气味'))

// 4 章节：写正文 + 状态位
await clickByText('.tab', '章节')
await sleep(150)
await clickByText('.primary-btn', '新章节')
await sleep(150)
await page.type('.title-input', '第 1 章')
await page.type('.body-input', '她让锄拔掉那株草。')
await clickByText('.ghost-btn', '添加状态位')
await sleep(150)
const labels = await page.$$('.field-label')
await labels[labels.length - 1].type('电量')
const values = await page.$$('.field-value')
await values[values.length - 1].type('68')
await sleep(250)
s = await store()
ok('章节已创建', s.drafts.length === 1)
const d0 = s.drafts[0] || { flags: [] }
ok('状态位已保存', d0.flags.some((f) => f.label === '电量' && f.value === '68'))

// 5 载入示例
await clickByText('.tab', '备份')
await sleep(150)
await clickByText('.ghost-btn', '载入示例')
await sleep(400)
s = await store()
ok('示例卡片载入 6 张', s.cards.length === 6, 'cards = ' + s.cards.length)
ok('示例章节载入 4 篇', s.drafts.length === 4, 'drafts = ' + s.drafts.length)

// 6 一致性
await clickByText('.tab', '一致性')
await sleep(300)
const issues = await page.$$eval('.issue', (els) =>
  els.map((e) => ({ cls: e.className, text: (e.textContent || '').trim() }))
)
ok('一致性面板有输出', issues.length > 0, 'issues = ' + issues.length)
ok('检出禁忌冲突（点火）', issues.some((i) => i.cls.includes('warn') && i.text.includes('点火')))
ok('检出人物被写丢', issues.some((i) => i.text.includes('未出现')))
ok('列出没用上的素材', issues.some((i) => i.text.includes('还没在正文中被用过')))

// 7 点提示跳转
const before = await page.$eval('.tab.on', (el) => el.textContent)
await page.click('.issue.warn')
await sleep(250)
const after = await page.$eval('.tab.on', (el) => el.textContent)
ok('点冲突提示能跳转到章节', before !== after, before + ' -> ' + after)

// 8 导出
await clickByText('.tab', '备份')
await sleep(150)
await clickByText('.primary-btn', '导出全部')
await sleep(1500)
const msg = await page.$eval('.backup-msg', (el) => el.textContent.trim()).catch(() => '')
ok('导出有结果反馈', msg.length > 0, 'msg = ' + msg)
ok('导出未报错', !msg.includes('失败'), 'msg = ' + msg)

// 9 控制台无错误
ok('无 JS 运行时错误', errors.length === 0, errors.slice(0, 3).join(' | '))

await browser.close()

console.log(`\n=== ${pass} 通过 / ${fail} 失败 ===\n`)
process.exit(fail === 0 ? 0 : 1)
