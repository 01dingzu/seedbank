import type { Field } from '../types'

interface Props {
  fields: Field[]
  onChange: (fields: Field[]) => void
  addLabel?: string
}

export default function Fields({ fields, onChange, addLabel = '添加字段' }: Props) {
  const set = (i: number, patch: Partial<Field>) => {
    const next = fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f))
    onChange(next)
  }
  const remove = (i: number) => onChange(fields.filter((_, idx) => idx !== i))
  const add = () => onChange([...fields, { label: '', value: '' }])

  return (
    <div className="fields">
      {fields.map((f, i) => (
        <div className="field-row" key={i}>
          <input
            className="field-label"
            value={f.label}
            placeholder="字段名"
            onChange={(e) => set(i, { label: e.target.value })}
          />
          <input
            className="field-value"
            value={f.value}
            placeholder="内容"
            onChange={(e) => set(i, { value: e.target.value })}
          />
          <button type="button" className="icon-btn" onClick={() => remove(i)} title="删除字段">
            ×
          </button>
        </div>
      ))}
      <button type="button" className="ghost-btn" onClick={add}>
        + {addLabel}
      </button>
    </div>
  )
}
