import { toSegments } from '../lib/links'

interface Props {
  text: string
  onLink: (title: string) => void
}

export default function RichText({ text, onLink }: Props) {
  const segs = toSegments(text)
  return (
    <span className="rich">
      {segs.map((s, i) =>
        s.kind === 'link' ? (
          <button key={i} type="button" className="link-chip" onClick={() => onLink(s.value)}>
            {s.value}
          </button>
        ) : (
          <span key={i}>{s.value}</span>
        )
      )}
    </span>
  )
}
