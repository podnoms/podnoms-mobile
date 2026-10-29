import { useInfiniteQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { Search } from 'lucide-react-native'
import { useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { useDebounced } from '@/hooks/use-debounced'
import { gifAttribution, searchGifs, type GifConfig, type GifResult } from '@/lib/gifs'

const columns = 3

// Searching GIFs to add to a comment: trending ones until something's typed.
// In place of the keyboard, at about its height.
export function GifPicker({ config, onPick }: { config: GifConfig; onPick: (gif: GifResult) => void }) {
  const [query, setQuery] = useState('')
  const debounced = useDebounced(query.trim(), 350)
  const gifs = useInfiniteQuery({
    queryKey: ['gifs', config.provider, debounced],
    queryFn: ({ pageParam, signal }) => searchGifs(config, debounced, pageParam, signal),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (page) => page.next ?? undefined,
    staleTime: 5 * 60_000,
  })
  const results = gifs.data?.pages.flatMap((page) => page.results) ?? []
  const attribution = gifAttribution[config.provider]

  return (
    <View className="h-80 gap-2">
      <View className="flex-row items-center gap-2">
        <Icon as={Search} size={16} className="text-muted-foreground" />
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search GIFs"
          autoCorrect={false}
          returnKeyType="search"
          className="h-9 flex-1"
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(gif) => `${gif.provider}:${gif.id}`}
        numColumns={columns}
        columnWrapperClassName="gap-1"
        contentContainerClassName="gap-1"
        keyboardShouldPersistTaps="handled"
        onEndReached={() => gifs.hasNextPage && !gifs.isFetchingNextPage && void gifs.fetchNextPage()}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPick(item)}
            className="flex-1 overflow-hidden bg-muted active:opacity-70"
            style={{ aspectRatio: 1, maxWidth: `${100 / columns}%` }}
            accessibilityLabel={item.title || 'GIF'}>
            <Image source={{ uri: item.preview.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </Pressable>
        )}
        ListEmptyComponent={
          gifs.isPending ? (
            <ActivityIndicator className="py-8" />
          ) : (
            <Text variant="muted" className="py-8 text-center">
              {gifs.isError ? "Couldn't load GIFs." : 'No GIFs found.'}
            </Text>
          )
        }
        ListFooterComponent={gifs.isFetchingNextPage ? <ActivityIndicator className="py-3" /> : undefined}
      />
      {attribution && (
        <Text variant="muted" className="text-center text-xs">
          {attribution}
        </Text>
      )}
    </View>
  )
}
