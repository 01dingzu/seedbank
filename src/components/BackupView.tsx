import { useRef, useState } from 'react'
import { useStore } from '../store'
import { buildZip, download } from '../lib/export'
import type { Snapshot } from '../types'

export default function BackupView() {
  const cards = useStore((s) => s.cards)
  const drafts = useStore((s) => s.drafts)
  const loadSample = useStore((s) => s.loadSample)
  const importSnapshot = useStore((s) => s.importSnapshot)
  const clearAll = useStore((s) => s.clearAll)

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const doExport = async () => {
    setBusy(true)
    setMsg('打包中…')
    try {
      const blob = await buildZip(cards, drafts)
      const d = new Date()
      const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
        d.getDate()
      ).padStart(2, '0')}`
      download(blob, `seedbank-${stamp}.zip`)
      setMsg(`已导出 ${cards.length} 张卡片、${drafts.length} 篇章节。`)
    } catch (e) {
      setMsg(`导出失败：${String(e)}`)
    } finally {
      setBusy(false)
    }
  }

  const doImport = async (file: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      const snap = JSON.parse(text) as Snapshot
      if (!snap || !Array.isArray(snap.cards)) throw new Error('不是种子库的备份文件')
      if (!confirm(`导入 ${snap.cards.length} 张卡片、${snap.drafts.length} 篇章节？会覆盖当前数据。`)) return
      importSnapshot(snap)
      setMsg('导入完成。')
    } catch (e) {
      setMsg(`导入失败：${String(e)}`)
    }
  }

  return (
    <div className="backup">
      <div className="backup-card">
        <div className="block-title">导出</div>
        <p className="block-hint">
          打包成 zip：包含 seedbank.json（完整数据，可还原）、cards/ 与 drafts/ 的 Markdown、images/ 里的参考图。
          数据在你自己手上，随时可以带走。
        </p>
        <button type="button" className="primary-btn" onClick={() => void doExport()} disabled={busy}>
          导出全部
        </button>
      </div>

      <div className="backup-card">
        <div className="block-title">导入</div>
        <p className="block-hint">选择之前导出的 seedbank.json，会覆盖当前全部数据。</p>
        <label className="ghost-btn file-btn">
          选择备份文件
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              void doImport(e.target.files?.[0] || null)
              e.target.value = ''
            }}
          />
        </label>
      </div>

      <div className="backup-card">
        <div className="block-title">示例素材</div>
        <p className="block-hint">
          载入一份示例（一张设定、三个人物、一个场景、一个片段 + 4 章正文），用来看看一致性检查长什么样。会覆盖当前数据。
        </p>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            if (confirm('载入示例素材？会覆盖当前数据。')) loadSample()
          }}
        >
          载入示例
        </button>
      </div>

      <div className="backup-card">
        <div className="block-title">清空</div>
        <p className="block-hint">删除所有卡片与章节，参考图仍会留在浏览器里。</p>
        <button
          type="button"
          className="ghost-btn danger"
          onClick={() => {
            if (confirm('清空全部卡片与章节？建议先导出备份。')) clearAll()
          }}
        >
          清空全部
        </button>
      </div>

      {msg ? <div className="backup-msg">{msg}</div> : null}

      <div className="backup-foot">
        数据存在这台设备的浏览器里（localStorage + IndexedDB），不上传、不需要登录。换设备请先导出再导入。
      </div>
    </div>
  )
}
