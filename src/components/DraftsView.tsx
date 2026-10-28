import { useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { searchDrafts } from '../lib/search'
import { extractLinks } from '../lib/links'
import Fields from './Fields'
import RichText from './RichText'

interface Props {
  selectedId: string | null
  onSelect: (id: string | null) => void
  onLink: (title: string) => void
}

export default function DraftsView({ selectedId, onSelect, onLink }: Props) {
  const cards = useStore((s) => s.cards)
  const drafts = useStore((s) => s.drafts)
  const addDraft = useStore((s) => s.addDraft)
  const updateDraft = useStore((s) => s.updateDraft)
  const deleteDraft = useStore((s) => s.deleteDraft)

  const [q, setQ] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  const list = useMemo(() => searchDrafts(drafts, q), [drafts, q])
  const draft = drafts.find((d) => d.id === selectedId) || null

  const insert = (title: string) => {
    if (!draft) return
    const token = `[[${title}]]`
    const el = ref.current
    if (!el) {
      updateDraft(draft.id, { body: draft.body + token })
      return
    }
    const s = el.selectionStart
    const e = el.selectionEnd
    updateDraft(draft.id, { body: draft.body.slice(0, s) + token + draft.body.slice(e) })
    requestAnimationFrame(() => {
      el.focus()
      const pos = s + token.length
      el.selectionStart = pos
      el.selectionEnd = pos
    })
  }

  const outgoing = draft ? extractLinks(draft.body) : []

  return (
    <div className="split">
      <div className="pane">
        <div className="pane-head">
          <input
            className="search"
            value={q}
            placeholder="搜索章节…"
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            className="primary-btn sm"
            onClick={() => onSelect(addDraft())}
          >
            + 新章节
          </button>
        </div>
        <div className="pane-list">
          {list.length === 0 ? (
            <p className="empty">还没有章节。</p>
          ) : (
            list.map((d) => (
              <button
                key={d.id}
                type="button"
                className={d.id === selectedId ? 'list-item on' : 'list-item'}
                onClick={() => onSelect(d.id)}
              >
                <span className="item-title">{d.title}</span>
                <span className="item-sub">
                  {d.body.length} 字 · {d.flags.filter((f) => f.value.trim()).length} 个状态位
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="pane main-pane">
        {!draft ? (
          <div className="empty-state">
            <p>左边选一章，或者新建一章。</p>
            <p className="block-hint">
              章节写完后，「一致性」那一页会告诉你：谁被写丢了、哪里和设定冲突、哪些素材还没用上。
            </p>
          </div>
        ) : (
          <div className="editor">
            <div className="editor-head">
              <span className="head-label">章节</span>
              <span className="stamp">{new Date(draft.updatedAt).toLocaleString('zh-CN')}</span>
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => {
                  if (confirm(`删除《${draft.title}》？`)) {
                    deleteDraft(draft.id)
                    onSelect(null)
                  }
                }}
              >
                删除
              </button>
            </div>

            <input
              className="title-input"
              value={draft.title}
              placeholder="第 N 章 · 标题"
              onChange={(e) => updateDraft(draft.id, { title: e.target.value })}
            />

            <div className="block">
              <div className="block-title">正文</div>
              <div className="insert-row">
                <select
                  className="insert-select"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) insert(e.target.value)
                  }}
                >
                  <option value="">插入卡片链接…</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <span className="block-hint">在正文里写 [[标题]] 也能连上</span>
              </div>
              <textarea
                ref={ref}
                className="body-input tall"
                value={draft.body}
                placeholder="写这一章。"
                onChange={(e) => updateDraft(draft.id, { body: e.target.value })}
              />
              {draft.body.trim() ? (
                <div className="preview">
                  <RichText text={draft.body} onLink={onLink} />
                </div>
              ) : null}
              {outgoing.length ? (
                <div className="chips">
                  {outgoing.map((t, i) => (
                    <span key={i} className="chip static">
                      → {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="block">
              <div className="block-title">本章状态位</div>
              <Fields
                fields={draft.flags}
                onChange={(flags) => updateDraft(draft.id, { flags })}
                addLabel="添加状态位"
              />
              <p className="block-hint">
                随手记下「这一章改变了什么」。做分支游戏时，这些就是现成的数据源。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
