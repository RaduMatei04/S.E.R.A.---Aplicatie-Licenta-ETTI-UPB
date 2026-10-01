import { cn } from 'cn'
import { Badge } from '@/components/ui/badge'
import { useDeviceStatus } from '@/hooks/useDeviceStatus'
import { formatRelative } from '@/lib/format'

/**
 * Starea stației de senzori, afișată în antetul paginilor.
 *
 * Device-ul nu anunță niciodată că pleacă — backend-ul deduce starea din tăcere — deci
 * „offline” înseamnă „nu a mai trimis nimic”, iar momentul ultimei recepții este
 * informația care contează de fapt.
 */
export function DeviceStatusBadge() {
  const { data, isPending } = useDeviceStatus()

  if (isPending) {
    return <Badge variant="outline" className="text-muted-foreground">Se verifică…</Badge>
  }
  if (!data) {
    return null
  }

  const lastSeen = formatRelative(data.lastSeen)

  return (
    <Badge variant="outline" className="gap-2 text-muted-foreground">
      <span
        aria-hidden
        className={cn(
          'size-2 rounded-full',
          data.online ? 'bg-brand' : 'bg-muted-foreground/50',
        )}
      />
      {data.online ? 'Stație conectată' : 'Stație deconectată'}
      {lastSeen && <span className="text-foreground/70">· {lastSeen}</span>}
    </Badge>
  )
}
