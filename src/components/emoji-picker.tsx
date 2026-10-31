import { Search } from 'lucide-react-native'
import { useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { emojiGroups, emojisInGroup, searchEmojis } from '@/lib/emojis'
import { cn } from '@/lib/utils'

const columns = 8

// Choosing an emoji, by group or by searching. In place of the keyboard, at
// about its height, and stays open so several can be added.
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState(emojiGroups[0]!.id)
  const searching = query.trim().length > 0
  const emojis = searching ? searchEmojis(query) : emojisInGroup(group)

  return (
    <View className="h-80 gap-2">
      <View className="flex-row items-center gap-2">
        <Icon as={Search} size={16} className="text-muted-foreground" />
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search emoji"
          autoCorrect={false}
          returnKeyType="search"
          className="h-9 flex-1"
        />
      </View>
      {!searching && (
        <View className="flex-row justify-between">
          {emojiGroups.map(({ id, label, icon }) => (
            <Pressable
              key={id}
              onPress={() => setGroup(id)}
              className={cn('flex-1 items-center rounded-md py-1', id === group && 'bg-muted')}
              accessibilityLabel={label}
              accessibilityState={{ selected: id === group }}>
              <Text>{icon}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <FlatList
        // A group's list starts at its top.
        key={searching ? 'search' : group}
        data={emojis}
        keyExtractor={({ emoji }) => emoji}
        numColumns={columns}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={columns * 8}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPick(item.emoji)}
            className="flex-1 items-center justify-center rounded-md active:bg-muted"
            style={{ aspectRatio: 1, maxWidth: `${100 / columns}%` }}
            accessibilityLabel={item.label}>
            <Text className="text-2xl">{item.emoji}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text variant="muted" className="py-8 text-center">
            No emoji found.
          </Text>
        }
      />
    </View>
  )
}
