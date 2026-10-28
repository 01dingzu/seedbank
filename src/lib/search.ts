import type { Card, Draft } from '../types'

const has = (s: string, q: string) => s.toLowerCase().includes(q)

export function searchCards(cards: Card[], q: string): Card[] {
  const s = q.trim().toLowerCase()
  if (!s) return cards
  return cards.filter(
    (c) =>
      has(c.title, s) ||
      has(c.subtitle, s) ||
      has(c.body, s) ||
      c.fields.some((f) => has(f.label, s) || has(f.value, s))
  )
}

export function searchDrafts(drafts: Draft[], q: string): Draft[] {
  const s = q.trim().toLowerCase()
  if (!s) return drafts
  return drafts.filter(
    (d) => has(d.title, s) || has(d.body, s) || d.flags.some((f) => has(f.label, s) || has(f.value, s))
  )
}
