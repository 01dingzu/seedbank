import JSZip from 'jszip'
import type { Card, Draft, Snapshot } from '../types'
import { listImages } from '../db'
import { stripLinks, extractLinks } from './links'

const safeName = (s: string) => (s.replace(/[\\/:*?"<>|]/g, '_').trim().slice(0, 60) || 'untitled')
const stamp = (t: number) => new Date(t).toISOString().slice(0, 16).replace('T', ' ')

function frontmatter(pairs: [string, string][]): string {
  return '---\n' + pairs.map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n\n'
}

function cardToMd(c: Card): string {
  let md = frontmatter([
    ['title', c.title],
    ['type', c.type],
    ['subtitle', c.subtitle],
    ['updated', stamp(c.updatedAt)],
  ])
  if (c.fields.filter((f) => f.value.trim()).length) {
    for (const f of c.fields) {
      if (f.value.trim()) md += `**${f.label}**：${f.value}\n\n`
    }
  }
  md += stripLinks(c.body) + '\n'
  if (c.images.length) {
    md += '\n参考图：' + c.images.map((i) => `../images/${i}`).join('、') + '\n'
  }
  return md
}

function draftToMd(d: Draft): string {
  let md = frontmatter([
    ['title', d.title],
    ['updated', stamp(d.updatedAt)],
  ])
  const flags = d.flags.filter((f) => f.label.trim() || f.value.trim())
  if (flags.length) {
    md += '## 本章状态位\n\n'
    for (const f of flags) md += `- ${f.label}：${f.value}\n`
    md += '\n'
  }
  md += '## 正文\n\n' + stripLinks(d.body) + '\n'
  return md
}

function extOf(type: string): string {
  const m = /image\/(\w+)/.exec(type || '')
  if (!m) return 'bin'
  return m[1] === 'jpeg' ? 'jpg' : m[1]
}

export async function buildZip(cards: Card[], drafts: Draft[]): Promise<Blob> {
  const zip = new JSZip()
  const snap: Snapshot = {
    version: 1,
    exportedAt: new Date().toISOString(),
    cards,
    drafts,
  }
  zip.file('seedbank.json', JSON.stringify(snap, null, 2))

  const cardsDir = zip.folder('cards')!
  for (const c of cards) cardsDir.file(`${safeName(c.title)}.md`, cardToMd(c))

  const draftsDir = zip.folder('drafts')!
  for (const d of drafts) draftsDir.file(`${safeName(d.title)}.md`, draftToMd(d))

  const imgs = await listImages()
  if (imgs.length) {
    const imgDir = zip.folder('images')!
    for (const { id, blob } of imgs) imgDir.file(`${id}.${extOf(blob.type)}`, blob)
  }

  const allLinks = new Set<string>()
  for (const c of cards) extractLinks(c.body).forEach((l) => allLinks.add(l))
  for (const d of drafts) extractLinks(d.body).forEach((l) => allLinks.add(l))
  const titles = new Set(cards.map((c) => c.title))
  const missing = [...allLinks].filter((l) => !titles.has(l))

  let readme = `# 种子库导出\n\n导出时间：${snap.exportedAt}\n\n`
  readme += `- 卡片 ${cards.length} 张\n- 章节 ${drafts.length} 篇\n- 参考图 ${imgs.length} 张\n\n`
  readme += `完整数据（含图片引用关系）在 \`seedbank.json\`，可用本应用的「导入备份」还原。\n`
  if (missing.length) {
    readme += `\n## 引用了但还没有对应卡片的链接\n\n`
    for (const m of missing) readme += `- ${m}\n`
  }
  zip.file('README.md', readme)

  return zip.generateAsync({ type: 'blob' })
}

export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
