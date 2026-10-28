import { useEffect, useState } from 'react'
import { getImage, putImage, delImage } from '../db'

function useImageUrl(id: string): string {
  const [url, setUrl] = useState('')
  useEffect(() => {
    let alive = true
    let obj = ''
    getImage(id).then((b) => {
      if (b && alive) {
        obj = URL.createObjectURL(b)
        setUrl(obj)
      }
    })
    return () => {
      alive = false
      if (obj) URL.revokeObjectURL(obj)
    }
  }, [id])
  return url
}

function Thumb({ id, onRemove }: { id: string; onRemove: () => void }) {
  const url = useImageUrl(id)
  return (
    <div className="thumb">
      {url ? <img src={url} alt="" /> : <div className="thumb-empty">…</div>}
      <button type="button" className="thumb-del" onClick={onRemove} title="移除">
        ×
      </button>
    </div>
  )
}

export default function Images({
  ids,
  onChange,
}: {
  ids: string[]
  onChange: (ids: string[]) => void
}) {
  const pick = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const next = [...ids]
    for (const f of Array.from(files)) {
      const id = `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
      await putImage(id, f)
      next.push(id)
    }
    onChange(next)
  }

  const remove = async (id: string) => {
    await delImage(id)
    onChange(ids.filter((x) => x !== id))
  }

  return (
    <div className="images">
      <div className="thumb-grid">
        {ids.map((id) => (
          <Thumb key={id} id={id} onRemove={() => void remove(id)} />
        ))}
      </div>
      <label className="ghost-btn file-btn">
        + 添加参考图
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            void pick(e.target.files)
            e.target.value = ''
          }}
        />
      </label>
    </div>
  )
}
