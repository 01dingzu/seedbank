import { useMemo } from 'react'
import { useStore } from '../store'
import { check } from '../lib/consistency'

interface Props {
  onOpenCard: (id: string) => void
  onOpenDraft: (id: string) => void
}

export default function ConsistencyView({ onOpenCard, onOpenDraft }: Props) {
  const cards = useStore((s) => s.cards)
  const drafts = useStore((s) => s.drafts)

  const issues = useMemo(() => check(cards, drafts), [cards, drafts])
  const warnCount = issues.filter((i) => i.level === 'warn').length

  return (
    <div className="consistency">
      <div className="cons-head">
        <div>
          <div className="cons-num">{issues.length}</div>
          <div className="cons-cap">
            条提示 · 其中 {warnCount} 条需要看一眼 · 基于 {drafts.length} 章正文扫描
          </div>
        </div>
      </div>

      {drafts.length === 0 ? (
        <p className="empty">还没有章节，写一点就能检查了。</p>
      ) : issues.length === 0 ? (
        <p className="empty">没发现问题。</p>
      ) : (
        <div className="issue-list">
          {issues.map((it) => (
            <button
              key={it.id}
              type="button"
              className={`issue ${it.level}`}
              onClick={() => {
                if (it.refType === 'card' && it.refId) onOpenCard(it.refId)
                if (it.refType === 'draft' && it.refId) onOpenDraft(it.refId)
              }}
            >
              <span className={`issue-tag ${it.level}`}>{it.level === 'warn' ? '冲突' : '提醒'}</span>
              <span className="issue-text">{it.text}</span>
            </button>
          ))}
        </div>
      )}

      <div className="cons-note">
        <div className="block-title">检查了什么</div>
        <ul>
          <li>
            <b>人物被写丢</b>：某个人物连续 {3} 章以上没出现，或从头到尾没出现过（会一并匹配「别称」字段里的名字）。
          </li>
          <li>
            <b>禁忌冲突</b>：卡片「禁忌」字段里的关键词出现在正文里。比如某个人物怕火，禁忌填「点火、明火」。
          </li>
          <li>
            <b>没用上的素材</b>：设定、场景、片段类卡片，标题从未在正文中出现。
          </li>
        </ul>
      </div>
    </div>
  )
}
