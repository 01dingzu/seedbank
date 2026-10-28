import type { Card, Draft } from '../types'

const now = Date.now()
const uid = (n: string) => `seed-${n}`

// 一份与任何具体作品无关的演示数据：海边旧书店。
// 唯一目的是演示四类卡片、双向链接与一致性检查的四类提示。
export function sampleCards(): Card[] {
  const t = now
  return [
    {
      id: uid('card-rule'),
      type: 'setting',
      title: '潮汐规则',
      subtitle: '这座书店只在退潮时开门',
      fields: [
        { label: '一句话', value: '涨潮时门是锁着的，谁也进不去' },
        { label: '状态位', value: '退潮 / 涨潮' },
        { label: '禁忌', value: '' },
      ],
      body: '一天两次退潮。开门时间不固定，写在门口的小黑板上。\n\n涨潮时整条路会被淹，[[旧书店]] 的门必须朝东开——朝西的话门会被水压顶死。',
      images: [],
      createdAt: t - 900000,
      updatedAt: t - 900000,
    },
    {
      id: uid('card-chen'),
      type: 'character',
      title: '老陈',
      subtitle: '书店老板 · 六十多岁，一条腿不方便',
      fields: [
        { label: '一句话', value: '从不推销，顾客问什么他才答什么' },
        { label: '别称', value: '陈伯、陈老板' },
        { label: '状态位', value: '未知 / 已出现 / 已交心' },
        { label: '标志台词', value: '「书不等人，人等书。」' },
        { label: '禁忌', value: '' },
      ],
      body: '他把书店开在 [[旧书店]] 那栋危楼里，是因为这楼是他父亲盖的。\n\n他不肯搬，也不肯修。两条路他都算过账，都不划算。',
      images: [],
      createdAt: t - 800000,
      updatedAt: t - 800000,
    },
    {
      id: uid('card-man'),
      type: 'character',
      title: '小满',
      subtitle: '来帮忙的女孩 · 十七岁',
      fields: [
        { label: '一句话', value: '手上总有伤，从不解释' },
        { label: '别称', value: '' },
        { label: '状态位', value: '未遇 / 已遇 / 已留下' },
        { label: '标志台词', value: '「我只问一次，你不说我就自己找。」' },
        { label: '禁忌', value: '点火、明火' },
      ],
      body: '她是从上一家店里跑出来的，那家店烧过一次。\n\n她肯留下，是因为 [[老陈]] 店里一盏灯都没有——只有几根蜡烛，还锁在抽屉里。',
      images: [],
      createdAt: t - 700000,
      updatedAt: t - 700000,
    },
    {
      id: uid('card-po'),
      type: 'character',
      title: '阿婆',
      subtitle: '住在堤坝那头 · 还没出场',
      fields: [
        { label: '一句话', value: '记得这条路上所有淹掉过的房子' },
        { label: '别称', value: '堤坝阿婆' },
        { label: '状态位', value: '未遇 / 已遇' },
        { label: '标志台词', value: '「这条路我走了六十年，它比我熟。」' },
        { label: '禁忌', value: '' },
      ],
      body: '她知道 [[潮汐规则]] 之外的事——比如哪一年的潮水到过哪个门牌。\n\n还没在正文里出现过，留着第二卷用。',
      images: [],
      createdAt: t - 600000,
      updatedAt: t - 600000,
    },
    {
      id: uid('card-shop'),
      type: 'scene',
      title: '旧书店',
      subtitle: '危楼一层 · 门朝东',
      fields: [
        { label: '地点', value: '堤坝东端' },
        { label: '时间', value: '每次退潮的三小时' },
        { label: '状态位', value: '开门 / 上锁 / 淹了' },
      ],
      body: '书受潮会卷边，所以靠墙那排书架全部垫高了二十公分。\n\n[[老陈]] 每天第一件事是挪书，第二件事是看黑板。',
      images: [],
      createdAt: t - 500000,
      updatedAt: t - 500000,
    },
    {
      id: uid('card-frag'),
      type: 'fragment',
      title: '那句话',
      subtitle: '可用于「第一次争执」',
      fields: [],
      body: '「书不等人，」陈伯说，「人等书。」\n\n她站在门口没进来，雨水顺着她的袖子滴在地板上。',
      images: [],
      createdAt: t - 400000,
      updatedAt: t - 400000,
    },
  ]
}

export function sampleDrafts(): Draft[] {
  const t = now
  return [
    {
      id: uid('draft-1'),
      title: '第 1 章 · 退潮',
      body: '退潮是早上六点。她到的时候，[[旧书店]] 的门已经开了。\n\n陈伯坐在柜台后面，没有抬头。她自己往里走，鞋底在地板上留下两个水印。\n\n「书不等人，」他说，「人等书。」\n\n那天她一本书也没买。走的时候 [[小满]] 正在把靠墙那排书往高处挪。',
      flags: [
        { label: '潮汐', value: '退潮' },
        { label: '小满', value: '未遇 → 已遇' },
        { label: '老陈', value: '已出现' },
      ],
      createdAt: t - 300000,
      updatedAt: t - 300000,
    },
    {
      id: uid('draft-2'),
      title: '第 2 章 · 抽屉',
      body: '柜台下面有个抽屉，锁着。\n\n她问里面是什么，[[小满]] 说蜡烛。她说那为什么不点。\n\n小满没有回答。过了很久她才说：那家店烧过一次。\n\n晚上她自己在走廊尽头点火烧了一叠废纸，火光把整面墙照了一下。',
      flags: [
        { label: '潮汐', value: '涨潮' },
        { label: '小满', value: '已遇' },
        { label: '抽屉', value: '已发现 / 未打开' },
      ],
      createdAt: t - 200000,
      updatedAt: t - 200000,
    },
    {
      id: uid('draft-3'),
      title: '第 3 章 · 黑板',
      body: '门口的小黑板上写着今天的开门时间，字是倒着的。\n\n她问他为什么倒着写，他说那是给对面堤坝上的人看的。\n\n她没有追问对面是谁。',
      flags: [
        { label: '潮汐', value: '退潮' },
        { label: '小满', value: '已遇' },
        { label: '黑板', value: '注意到倒字' },
      ],
      createdAt: t - 100000,
      updatedAt: t - 100000,
    },
    {
      id: uid('draft-4'),
      title: '第 4 章 · 卷边',
      body: '靠墙那排书还是卷了边。\n\n垫高二十公分也没用，潮气是从地底下往上走的。\n\n小满把卷边的书一本一本摊在柜台上晾，晾到一半就涨潮了。',
      flags: [
        { label: '潮汐', value: '涨潮' },
        { label: '小满', value: '已留下' },
        { label: '书', value: '受潮' },
      ],
      createdAt: t,
      updatedAt: t,
    },
  ]
}
