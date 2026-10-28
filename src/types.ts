export type CardType = 'setting' | 'character' | 'scene' | 'fragment'

export const CARD_TYPES: { key: CardType; label: string; hint: string }[] = [
  { key: 'setting', label: '设定', hint: '世界观规则、机制、时间线这类' },
  { key: 'character', label: '人物', hint: '主角、配角、反派' },
  { key: 'scene', label: '场景', hint: '常驻地点、房间、街区这类' },
  { key: 'fragment', label: '片段', hint: '一句话灵感、台词、随手记' },
]

export interface Field {
  label: string
  value: string
}

export interface Card {
  id: string
  type: CardType
  title: string
  subtitle: string
  fields: Field[]
  body: string
  images: string[]
  createdAt: number
  updatedAt: number
}

export interface Draft {
  id: string
  title: string
  body: string
  flags: Field[]
  createdAt: number
  updatedAt: number
}

export interface Snapshot {
  version: 1
  exportedAt: string
  cards: Card[]
  drafts: Draft[]
}

export const DEFAULT_FIELDS: Record<CardType, string[]> = {
  setting: ['一句话', '状态位', '禁忌'],
  character: ['一句话', '别称', '状态位', '标志台词', '禁忌'],
  scene: ['地点', '时间', '状态位'],
  fragment: [],
}

export const TYPE_LABEL: Record<CardType, string> = {
  setting: '设定',
  character: '人物',
  scene: '场景',
  fragment: '片段',
}
