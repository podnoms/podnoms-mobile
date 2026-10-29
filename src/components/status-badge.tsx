import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import type { EpisodeStatus } from '@/lib/api-types'

const labels: Record<Exclude<EpisodeStatus, 'ready'>, string> = {
  pending: 'Queued',
  processing: 'Processing',
  failed: 'Failed',
}

// An episode's state, when it isn't simply ready to play.
export function StatusBadge({ status, isPrivate }: { status: EpisodeStatus; isPrivate?: boolean }) {
  if (status === 'ready') {
    return isPrivate ? (
      <Badge variant="outline">
        <Text>Private</Text>
      </Badge>
    ) : null
  }
  return (
    <Badge variant={status === 'failed' ? 'destructive' : 'secondary'}>
      <Text>{labels[status]}</Text>
    </Badge>
  )
}
