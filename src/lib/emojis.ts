// The emoji the picker offers, from emojibase (as the site's picker is).

export type Emoji = { emoji: string; label: string; tags: string[] }

type EmojibaseEmoji = { emoji: string; label: string; tags?: string[]; group?: number; version: number }

// Newer ones show as empty boxes on phones whose system font doesn't have them.
// Emoji 14 is 2021's: Android 12L and iOS 15.4 have it.
const newestVersion = 14

// emojibase's groups, in its order, with the emoji that stands for each. Its
// group 2 is only skin tones and hair, for building others; its groupless
// entries are the letters flags are made of.
export const emojiGroups = [
  { id: 0, label: 'Smileys', icon: '😀' },
  { id: 1, label: 'People', icon: '👋' },
  { id: 3, label: 'Animals and nature', icon: '🐻' },
  { id: 4, label: 'Food and drink', icon: '🍔' },
  { id: 5, label: 'Travel and places', icon: '🚗' },
  { id: 6, label: 'Activities', icon: '⚽' },
  { id: 7, label: 'Objects', icon: '💡' },
  { id: 8, label: 'Symbols', icon: '❤️' },
  { id: 9, label: 'Flags', icon: '🏳️' },
]

let byGroup: Map<number, Emoji[]> | null = null

// Read the first time the picker opens, as there are thousands.
function emojisByGroup() {
  if (!byGroup) {
    byGroup = new Map()
    const data = require('emojibase-data/en/data.json') as EmojibaseEmoji[]
    for (const { emoji, label, tags = [], group, version } of data) {
      if (group === undefined || group === 2 || version > newestVersion) continue
      const emojis = byGroup.get(group) ?? []
      emojis.push({ emoji, label, tags })
      byGroup.set(group, emojis)
    }
  }
  return byGroup
}

export const emojisInGroup = (group: number) => emojisByGroup().get(group) ?? []

// Those whose name or tags have every word of the search in them.
export function searchEmojis(query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const matches = ({ label, tags }: Emoji) => words.every((word) => label.includes(word) || tags.some((tag) => tag.includes(word)))
  return emojiGroups.flatMap(({ id }) => emojisInGroup(id).filter(matches))
}
