export const LINK_RE = /\[\[([^[\]]+)\]\]/g

export function extractLinks(text: string): string[] {
  const out: string[] = []
  const re = new RegExp(LINK_RE.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const v = m[1].trim()
    if (v) out.push(v)
  }
  return out
}

export function stripLinks(text: string): string {
  return text.replace(new RegExp(LINK_RE.source, 'g'), '$1')
}

export type Segment = { kind: 'text' | 'link'; value: string }

export function toSegments(text: string): Segment[] {
  const segs: Segment[] = []
  let last = 0
  const re = new RegExp(LINK_RE.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segs.push({ kind: 'text', value: text.slice(last, m.index) })
    segs.push({ kind: 'link', value: m[1].trim() })
    last = m.index + m[0].length
  }
  if (last < text.length) segs.push({ kind: 'text', value: text.slice(last) })
  return segs
}

const norm = (s: string) => s.trim().toLowerCase()

export interface Backlink {
  kind: 'card' | 'draft'
  id: string
  title: string
  typeLabel: string
}

export function computeBacklinks(
  cards: { id: string; title: string; body: string; type: string }[],
  drafts: { id: string; title: string; body: string }[]
): Map<string, Backlink[]> {
  const map = new Map<string, Backlink[]>()
  const push = (target: string, bl: Backlink) => {
    const k = norm(target)
    const arr = map.get(k) || []
    if (!arr.some((x) => x.id === bl.id)) arr.push(bl)
    map.set(k, arr)
  }
  for (const c of cards) {
    for (const l of extractLinks(c.body)) {
      push(l, { kind: 'card', id: c.id, title: c.title, typeLabel: c.type })
    }
  }
  for (const d of drafts) {
    for (const l of extractLinks(d.body)) {
      push(l, { kind: 'draft', id: d.id, title: d.title, typeLabel: '章节' })
    }
  }
  return map
}

export function backlinksFor(map: Map<string, Backlink[]>, title: string): Backlink[] {
  return map.get(norm(title)) || []
}
