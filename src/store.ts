import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Card, CardType, Draft, Snapshot } from './types'
import { DEFAULT_FIELDS } from './types'
import { sampleCards, sampleDrafts } from './lib/seed'

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

interface State {
  cards: Card[]
  drafts: Draft[]
  addCard: (type: CardType, title?: string) => string
  updateCard: (id: string, patch: Partial<Card>) => void
  deleteCard: (id: string) => void
  addDraft: (title?: string) => string
  updateDraft: (id: string, patch: Partial<Draft>) => void
  deleteDraft: (id: string) => void
  loadSample: () => void
  importSnapshot: (s: Snapshot) => void
  clearAll: () => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      cards: [],
      drafts: [],

      addCard: (type, title) => {
        const id = uid()
        const now = Date.now()
        const card: Card = {
          id,
          type,
          title: title || '',
          subtitle: '',
          fields: DEFAULT_FIELDS[type].map((label) => ({ label, value: '' })),
          body: '',
          images: [],
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ cards: [card, ...s.cards] }))
        return id
      },

      updateCard: (id, patch) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)),
        })),

      deleteCard: (id) => set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),

      addDraft: (title) => {
        const id = uid()
        const now = Date.now()
        const draft: Draft = {
          id,
          title: title || `第 ${1} 章`,
          body: '',
          flags: [],
          createdAt: now,
          updatedAt: now,
        }
        set((s) => {
          const next: Draft = { ...draft, title: title || `第 ${s.drafts.length + 1} 章` }
          return { drafts: [...s.drafts, next] }
        })
        return id
      },

      updateDraft: (id, patch) =>
        set((s) => ({
          drafts: s.drafts.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d)),
        })),

      deleteDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),

      loadSample: () => set({ cards: sampleCards(), drafts: sampleDrafts() }),

      importSnapshot: (s) =>
        set({
          cards: Array.isArray(s.cards) ? s.cards : [],
          drafts: Array.isArray(s.drafts) ? s.drafts : [],
        }),

      clearAll: () => set({ cards: [], drafts: [] }),
    }),
    {
      name: 'seedbank-v1',
      partialize: (s) => ({ cards: s.cards, drafts: s.drafts }) as never,
    }
  )
)
