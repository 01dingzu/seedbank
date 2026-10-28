import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { CARD_TYPES, TYPE_LABEL, type CardType } from '../types'
import { searchCards } from '../lib/search'
import { backlinksFor, computeBacklinks } from '../lib/links'
import Fields from './Fields'
import Images from './Images'
import RichText from './RichText'

interface Props {
  selectedId: string | null
  onSelect: (id: string | null) => void
  onLink: (title: string) => void
}

export default function CardsView({ selectedId, onSelect, onLink }: Props) {
  const cards = useStore((s) => s.cards)
  const drafts = useStore((s) => s.drafts)
  const addCard = useStore((s) => s.addCard)
  const updateCard = useStore((s) => s.updateCard)
  const deleteCard = useStore((s) => s.deleteCard)

  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<CardType | 'all'>('all')

  const list = useMemo(() => {
    const found = searchCards(cards, q)
    return filter === 'all' ? found : found.filter((c) => c.type === filter)
  }, [cards, q, filter])

  const card = cards.find((c) => c.id === selectedId) || null

  const backlinkMap = useMemo(
    () => computeBacklinks(cards, drafts),
    [cards, drafts]
  )
  const backlinks = card ? backlinksFor(backlinkMap, card.title) : []

  const create = (type: CardType) => {
    const id = addCard(type, '')
    onSelect(id)
    setFilter('all')
    setQ('')
  }

  return (
    <div className="split">
      <div className="pane">
        <div className="pane-head">
          <input
            className="search"
            value={q}
            placeholder="搜索卡片…"
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="button" className="primary-btn sm" onClick={() => create('setting')}>
            + 新卡片
          </button>
        </div>
        <div className="chips">
          <button
            type="button"
            className={filter === 'all' ? 'chip on' : 'chip'}
            onClick={() => setFilter('all')}
          >
            全部 {cards.length}
          </button>
          {CARD_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              className={filter === t.key ? 'chip on' : 'chip'}
              onClick={() => setFilter(t.key)}
            >
              {t.label} {cards.filter((c) => c.type === t.key).length}
            </button>
          ))}
        </div>
        <div className="pane-list">
          {list.length === 0 ? (
            <p className="empty">没有匹配的卡片。</p>
          ) : (
            list.map((c) => (
              <button
                key={c.id}
                type="button"
                className={c.id === selectedId ? 'list-item on' : 'list-item'}
                onClick={() => onSelect(c.id)}
              >
                <span className={`badge t-${c.type}`}>{TYPE_LABEL[c.type]}</span>
                <span className="item-title">{c.title || '未命名'}</span>
                {c.subtitle ? <span className="item-sub">{c.subtitle}</span> : null}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="pane main-pane">
        {!card ? (
          <div className="empty-state">
            <p>左边选一张卡片，或者新建一张。</p>
            <div className="empty-actions">
              {CARD_TYPES.map((t) => (
                <button key={t.key} type="button" className="ghost-btn" onClick={() => create(t.key)}>
                  + {t.label}
                  <span className="hint-inline">{t.hint}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="editor">
            <div className="editor-head">
              <select
                className="type-select"
                value={card.type}
                onChange={(e) => updateCard(card.id, { type: e.target.value as CardType })}
              >
                {CARD_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="stamp">{new Date(card.updatedAt).toLocaleString('zh-CN')}</span>
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => {
                  if (confirm(`删除「${card.title || '未命名'}」？此操作不可撤销。`)) {
                    deleteCard(card.id)
                    onSelect(null)
                  }
                }}
              >
                删除
              </button>
            </div>

            <input
              className="title-input"
              value={card.title}
              placeholder="标题（在正文里写 [[标题]] 就能链过来）"
              onChange={(e) => updateCard(card.id, { title: e.target.value })}
            />
            <input
              className="sub-input"
              value={card.subtitle}
              placeholder="一句话说明"
              onChange={(e) => updateCard(card.id, { subtitle: e.target.value })}
            />

            <div className="block">
              <div className="block-title">字段</div>
              <Fields
                fields={card.fields}
                onChange={(fields) => updateCard(card.id, { fields })}
              />
              <p className="block-hint">
                「别称」用于一致性检查时多算几个名字；「禁忌」填逗号分隔的关键词，正文中出现就会报警。
              </p>
            </div>

            <div className="block">
              <div className="block-title">正文</div>
              <textarea
                className="body-input"
                value={card.body}
                placeholder="写点什么。用 [[卡片标题]] 连到别的卡片。"
                onChange={(e) => updateCard(card.id, { body: e.target.value })}
              />
              {card.body.trim() ? (
                <div className="preview">
                  <RichText text={card.body} onLink={onLink} />
                </div>
              ) : null}
            </div>

            <div className="block">
              <div className="block-title">参考图</div>
              <Images ids={card.images} onChange={(images) => updateCard(card.id, { images })} />
            </div>

            <div className="block">
              <div className="block-title">被引用（{backlinks.length}）</div>
              {backlinks.length === 0 ? (
                <p className="block-hint">还没有别的地方链到这张卡片。</p>
              ) : (
                <div className="chips">
                  {backlinks.map((b) => (
                    <span key={b.id} className="chip static">
                      {b.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
