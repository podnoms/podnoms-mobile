import { Link, Stack, useLocalSearchParams } from "expo-router";
import {
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
} from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { Artwork } from "@/components/artwork";
import { CommentComposer } from "@/components/comment-composer";
import { CommentItem } from "@/components/comment-item";
import { KeyboardSpacer } from "@/components/keyboard-spacer";
import { MiniPlayer } from "@/components/mini-player";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { Waveform, type WaveformMarker } from "@/components/waveform";
import { useEpisodePage, useWaveform } from "@/hooks/use-episode";
import type {
  CommentReply,
  EpisodeComment,
  EpisodePage,
} from "@/lib/api-types";
import {
  describeProgress,
  formatDate,
  formatDuration,
  formatTime,
} from "@/lib/format";
import { playbackRates, usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

// An episode: its details, playing it, and its comments, which can be added
// to, replied to and liked here.
export default function EpisodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useEpisodePage(id);
  const player = usePlayer();
  const [replyingTo, setReplyingTo] = useState<CommentReply | null>(null);
  const page = query.data;
  const { data: waveform } = useWaveform(
    page?.episode.status === "ready" ? id : undefined,
  );

  const isCurrent = player.episode?.id === id;
  // A new comment is about where the listener is now, or where they left off.
  const position = isCurrent
    ? player.status.currentTime
    : (page?.episode.positionSeconds ?? 0);
  const atSeconds = Math.floor(position);

  function playFrom(seconds?: number) {
    if (!page?.episode.audioUrl) return;
    if (isCurrent) {
      if (seconds === undefined) return player.toggle();
      player.seekTo(seconds);
      if (!player.status.playing) player.toggle();
      return;
    }
    player.play({
      id: page.episode.id,
      title: page.episode.title,
      showTitle: page.show.title,
      imageUrl: page.episode.imageUrl,
      audioUrl: page.episode.audioUrl,
      durationSeconds: page.episode.durationSeconds,
      positionSeconds: seconds ?? page.episode.positionSeconds,
    });
  }

  // Replies to a reply join its thread, as on the site.
  const items = (page?.comments ?? []).flatMap((comment) => [
    { comment, isReply: false },
    ...comment.replies.map((reply) => ({ comment: reply, isReply: true })),
  ]);
  const canComment = page?.episode.status === "ready";
  // Top-level comments, marked on the waveform where they were made.
  const markers: WaveformMarker[] = (page?.comments ?? []).map((comment) => ({
    id: comment.id,
    seconds: comment.atSeconds,
    imageUrl: comment.author.imageUrl,
    fallback: (comment.author.name ?? comment.author.slug)
      .slice(0, 1)
      .toUpperCase(),
  }));

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: page?.show.title ?? "" }} />
      <FlatList
        // Gives way to the composer as it grows (a GIF, the GIF picker).
        className="flex-1 bg-background"
        data={items}
        keyExtractor={(item) => item.comment.id}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
          />
        }
        ListHeaderComponent={
          page ? (
            <EpisodeHeader
              page={page}
              isPlaying={isCurrent && player.status.playing}
              onPlay={() => playFrom()}
              waveform={waveform ?? null}
              position={position}
              duration={
                (isCurrent && player.status.duration) ||
                page.episode.durationSeconds ||
                0
              }
              markers={markers}
              onSeek={playFrom}
              commentCount={page.comments.reduce(
                (n, c) => n + 1 + c.replies.length,
                0,
              )}
              controls={
                isCurrent
                  ? {
                      skip: player.skip,
                      rate: player.rate,
                      setRate: player.setRate,
                    }
                  : null
              }
            />
          ) : query.isPending ? (
            <View className="gap-3 p-4">
              <Skeleton className="h-32 w-32" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </View>
          ) : (
            <Text className="p-8 text-center">
              {query.error?.message ?? "Not found"}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <CommentItem
            comment={item.comment}
            episodeId={id}
            isReply={item.isReply}
            onReply={(comment) =>
              // Replies always go to the thread's first comment.
              setReplyingTo(
                item.isReply
                  ? (page!.comments.find((c: EpisodeComment) =>
                      c.replies.some((r) => r.id === comment.id),
                    ) ?? comment)
                  : comment,
              )
            }
            onPlayAt={page?.episode.audioUrl ? playFrom : undefined}
          />
        )}
        ListEmptyComponent={
          canComment ? (
            <View className="items-center gap-2 px-8 py-10">
              <Icon
                as={MessageCircle}
                size={28}
                className="text-muted-foreground"
              />
              <Text variant="muted" className="text-center">
                No comments yet. Say something about the bit you’re listening
                to.
              </Text>
            </View>
          ) : undefined
        }
      />
      {canComment && (
        <CommentComposer
          episodeId={id}
          atSeconds={atSeconds}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          gifs={page!.gifs}
        />
      )}
      {!isCurrent && <MiniPlayer />}
      {/* Keeps the composer just above the keyboard. */}
      <KeyboardSpacer />
    </View>
  );
}

// Descriptions longer than this start folded.
const longDescription = 280;

function EpisodeHeader({
  page,
  isPlaying,
  onPlay,
  waveform,
  position,
  duration,
  markers,
  onSeek,
  commentCount,
  controls,
}: {
  page: EpisodePage;
  isPlaying: boolean;
  onPlay: () => void;
  waveform: number[] | null;
  // Where the listener is, or left off, and how long the episode is.
  position: number;
  duration: number;
  markers: WaveformMarker[];
  // Plays from that point.
  onSeek: (seconds: number) => void;
  commentCount: number;
  // Skipping and speed, while this is the episode playing.
  controls: {
    skip: (seconds: number) => void;
    rate: number;
    setRate: (rate: number) => void;
  } | null;
}) {
  const { episode, show } = page;
  const [expanded, setExpanded] = useState(false);
  // Where a drag along the waveform would play from, shown in place of the time.
  const [scrub, setScrub] = useState<number | null>(null);
  const working =
    episode.status === "pending" || episode.status === "processing";
  const progress = working ? describeProgress(episode.progress) : null;
  const meta = [
    formatDate(episode.publishedAt ?? episode.createdAt),
    formatDuration(episode.durationSeconds),
    episode.positionSeconds && episode.durationSeconds
      ? `${formatTime(episode.durationSeconds - episode.positionSeconds)} left`
      : null,
  ].filter(Boolean);

  return (
    <View
      className={cn(
        "gap-4 p-4",
        episode.status === "ready" ? "pb-1" : "border-b border-border",
      )}
    >
      <View className="flex-row gap-4">
        <Artwork uri={episode.imageUrl} size={112} />
        <View className="flex-1 gap-1">
          <Text variant="h4">{episode.title}</Text>
          <Link href={{ pathname: "/shows/[id]", params: { id: show.id } }}>
            <Text className="text-primary">{show.title}</Text>
          </Link>
          <Text variant="muted">{meta.join(" · ")}</Text>
          <StatusBadge status={episode.status} isPrivate={episode.private} />
        </View>
      </View>

      {/* As on the site: playing beside the waveform, which plays from wherever
          it's pressed, with the comments marked along it. Waveforms are made
          just after processing; until then, a plain button. */}
      {episode.audioUrl && waveform && duration ? (
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={onPlay}
            className="h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-80"
            accessibilityLabel={isPlaying ? "Pause" : "Play"}
          >
            <Icon
              as={isPlaying ? Pause : Play}
              size={24}
              className="text-primary-foreground"
            />
          </Pressable>
          <View className="flex-1 gap-1">
            <Waveform
              values={waveform}
              duration={duration}
              position={position}
              onSeek={onSeek}
              onScrub={setScrub}
              markers={markers}
              size="compact"
            />
            <View className="flex-row justify-between">
              <Text variant="muted" className="text-xs">
                {formatTime(scrub ?? position)}
              </Text>
              <Text variant="muted" className="text-xs">
                {formatTime(duration)}
              </Text>
            </View>
          </View>
        </View>
      ) : episode.audioUrl ? (
        <Button onPress={onPlay}>
          <Icon as={isPlaying ? Pause : Play} />
          <Text>
            {isPlaying
              ? "Pause"
              : episode.positionSeconds
                ? `Resume from ${formatTime(episode.positionSeconds)}`
                : "Play"}
          </Text>
        </Button>
      ) : null}
      {controls && (
        <View className="flex-row items-center justify-center gap-10">
          <Pressable
            onPress={() => controls.skip(-15)}
            hitSlop={12}
            accessibilityLabel="Back 15 seconds"
          >
            <Icon as={RotateCcw} size={24} className="text-foreground" />
          </Pressable>
          <Pressable
            onPress={() =>
              controls.setRate(
                playbackRates[
                  (playbackRates.indexOf(controls.rate) + 1) %
                    playbackRates.length
                ]!,
              )
            }
            className="min-w-16 items-center border border-border px-3 py-1.5 active:bg-muted"
            accessibilityLabel={`Playback speed ${controls.rate}x`}
          >
            <Text className="font-semibold">{controls.rate}×</Text>
          </Pressable>
          <Pressable
            onPress={() => controls.skip(30)}
            hitSlop={12}
            accessibilityLabel="Forward 30 seconds"
          >
            <Icon as={RotateCw} size={24} className="text-foreground" />
          </Pressable>
        </View>
      )}
      {progress && (
        <View className="gap-1">
          <Text variant="muted">{progress.label}</Text>
          {progress.fraction !== null && (
            <Progress value={progress.fraction * 100} className="h-1" />
          )}
        </View>
      )}
      {episode.status === "failed" && episode.error && (
        <Text variant="muted">{episode.error}</Text>
      )}

      {episode.description ? (
        episode.description.length > longDescription ? (
          <Pressable
            onPress={() => setExpanded(!expanded)}
            accessibilityLabel={expanded ? "Show less" : "Show more"}
          >
            <Text numberOfLines={expanded ? undefined : 5}>
              {episode.description.trim()}
            </Text>
            <Text className="pt-1 text-sm font-medium text-primary">
              {expanded ? "Less" : "More"}
            </Text>
          </Pressable>
        ) : (
          <Text>{episode.description.trim()}</Text>
        )
      ) : null}

      {episode.status === "ready" && (
        // Its own section, joined to the list below rather than closing the header.
        <View className="-mx-4 flex-row items-baseline gap-2 border-t border-border px-4 pt-4">
          <Text variant="large">Comments</Text>
          {commentCount > 0 && <Text variant="muted">{commentCount}</Text>}
        </View>
      )}
    </View>
  );
}
