import { stripLinks } from './links'
import type { Card, Draft } from '../types'

export interface Issue {
  id: string
  level: 'warn' | 'info'
  text: string
  refType?: 'card' | 'draft'
  refId?: string
  refTitle?: string
}

export const GAP_THRESHOLD = 3

function fieldValue(card: Card, label: string): string {
  const f = card.fields.find((x) => x.label === label)
  return f ? f.value : ''
}

function aliases(card: Card): string[] {
  const out = [card.title]
  const nick = fieldValue(card, '别称')
  if (nick) out.push(...nick.split(/[,，、;；\s]+/))
  return out.map((s) => s.trim()).filter(Boolean)
}

export function check(cards: Card[], drafts: Draft[]): Issue[] {
  const issues: Issue[] = []
  const ordered = [...drafts].sort((a, b) => a.createdAt - b.createdAt)
  const plain = ordered.map((d) => ({ d, text: stripLinks(d.body) }))
  if (plain.length === 0) return issues

  // 一、人物被写丢
  for (const c of cards.filter((x) => x.type === 'character')) {
    const names = aliases(c)
    const hits: number[] = []
    plain.forEach((p, i) => {
      if (names.some((n) => p.text.includes(n))) hits.push(i)
    })
    if (hits.length === 0) {
      issues.push({
        id: `char-absent-${c.id}`,
        level: 'info',
        text: `「${c.title}」在所有章节里都没出现过`,
        refType: 'card',
        refId: c.id,
        refTitle: c.title,
      })
    } else {
      const last = Math.max(...hits)
      const gap = plain.length - 1 - last
      if (gap >= GAP_THRESHOLD) {
        issues.push({
          id: `char-gap-${c.id}`,
          level: 'warn',
          text: `「${c.title}」已有 ${gap} 章未出现（最后一次在《${plain[last].d.title}》）`,
          refType: 'card',
          refId: c.id,
          refTitle: c.title,
        })
      }
    }
  }

  // 二、与禁忌设定冲突
  for (const c of cards) {
    const taboo = fieldValue(c, '禁忌')
    if (!taboo.trim()) continue
    const words = taboo
      .split(/[,，、;；]/)
      .map((s) => s.trim())
      .filter(Boolean)
    for (const w of words) {
      for (const p of plain) {
        if (p.text.includes(w)) {
          issues.push({
            id: `taboo-${c.id}-${p.d.id}-${w}`,
            level: 'warn',
            text: `《${p.d.title}》出现了「${w}」，与「${c.title}」的禁忌设定冲突`,
            refType: 'draft',
            refId: p.d.id,
            refTitle: p.d.title,
          })
        }
      }
    }
  }

  // 三、还没用上的素材（人物已在上一条覆盖，这里跳过）
  const allText = plain.map((p) => p.text).join('\n')
  for (const c of cards.filter((x) => x.type !== 'character')) {
    const used = aliases(c).some((n) => allText.includes(n))
    if (!used) {
      issues.push({
        id: `unused-${c.id}`,
        level: 'info',
        text: `「${c.title}」还没在正文中被用过`,
        refType: 'card',
        refId: c.id,
        refTitle: c.title,
      })
    }
  }

  const order = { warn: 0, info: 1 }
  return issues.sort((a, b) => order[a.level] - order[b.level])
}
