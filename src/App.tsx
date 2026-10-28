import { useState } from 'react'
import { useStore } from './store'
import Capture from './components/Capture'
import CardsView from './components/CardsView'
import DraftsView from './components/DraftsView'
import ConsistencyView from './components/ConsistencyView'
import BackupView from './components/BackupView'

type Tab = 'capture' | 'cards' | 'drafts' | 'consistency' | 'backup'

export default function App() {
  const [tab, setTab] = useState<Tab>('capture')
  const [cardId, setCardId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)

  const cards = useStore((s) => s.cards)
  const drafts = useStore((s) => s.drafts)
  const addCard = useStore((s) => s.addCard)

  const openCard = (id: string) => {
    setCardId(id)
    setTab('cards')
  }
  const openDraft = (id: string) => {
    setDraftId(id)
    setTab('drafts')
  }
  const openLink = (title: string) => {
    const t = title.trim()
    if (!t) return
    const hit = cards.find((c) => c.title.trim().toLowerCase() === t.toLowerCase())
    if (hit) {
      openCard(hit.id)
    } else {
      openCard(addCard('setting', t))
    }
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'capture', label: '速记' },
    { key: 'cards', label: '卡片', count: cards.length },
    { key: 'drafts', label: '章节', count: drafts.length },
    { key: 'consistency', label: '一致性' },
    { key: 'backup', label: '备份' },
  ]

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          种子库<span className="brand-sub">小说素材</span>
        </div>
        <nav className="tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={tab === t.key ? 'tab on' : 'tab'}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.count !== undefined ? <span className="tab-count">{t.count}</span> : null}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {tab === 'capture' ? <Capture onOpenCard={openCard} onLink={openLink} /> : null}
        {tab === 'cards' ? (
          <CardsView selectedId={cardId} onSelect={setCardId} onLink={openLink} />
        ) : null}
        {tab === 'drafts' ? (
          <DraftsView selectedId={draftId} onSelect={setDraftId} onLink={openLink} />
        ) : null}
        {tab === 'consistency' ? (
          <ConsistencyView onOpenCard={openCard} onOpenDraft={openDraft} />
        ) : null}
        {tab === 'backup' ? <BackupView /> : null}
      </main>
    </div>
  )
}
