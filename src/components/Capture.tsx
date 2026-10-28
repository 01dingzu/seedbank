import { useState } from 'react'
import { useStore } from '../store'
import { CARD_TYPES, TYPE_LABEL, type CardType } from '../types'
import RichText from './RichText'

interface Props {
  onOpenCard: (id: string) => void
  onLink: (title: string) => void
}

export default function Capture({ onOpenCard, onLink }: Props) {
  const cards = useStore((s) => s.cards)
  const addCard = useStore((s) => s.addCard)
  const updateCard = useStore((s) => s.updateCard)
  const [text, setText] = useState('')
  const [type, setType] = useState<CardType>('fragment')

  const save = () => {
    const v = text.trim()
    if (!v) return
    const first = v.split('\n')[0].trim().slice(0, 24) || '未命名'
    const id = addCard(type, first)
    updateCard(id, { body: v })
    setText('')
  }

  const recent = [...cards].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12)

  return (
    <div className="capture">
      <div className="capture-box">
        <textarea
          className="capture-input"
          value={text}
          placeholder="想到什么就写下来。不用分类，回车换行，Ctrl / ⌘ + Enter 存进去。"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault()
              save()
            }
          }}
        />
        <div className="capture-bar">
          <div className="seg">
            {CARD_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                className={t.key === type ? 'seg-btn on' : 'seg-btn'}
                onClick={() => setType(t.key)}
                title={t.hint}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button type="button" className="primary-btn" onClick={save} disabled={!text.trim()}>
            存进去
          </button>
        </div>
      </div>

      <div className="section-title">最近记下的</div>
      {recent.length === 0 ? (
        <p className="empty">还没有素材。上面写一句试试——类型可以后面再改。</p>
      ) : (
        <div className="recent-list">
          {recent.map((c) => (
            <button key={c.id} type="button" className="recent-item" onClick={() => onOpenCard(c.id)}>
              <span className={`badge t-${c.type}`}>{TYPE_LABEL[c.type]}</span>
              <span className="recent-title">{c.title}</span>
              <span className="recent-body">
                <RichText text={c.body.slice(0, 60)} onLink={onLink} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
