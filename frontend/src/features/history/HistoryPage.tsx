import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { EventSeverity, EventType } from '@/api/types'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingCard } from '@/components/feedback/LoadingCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEvents } from '@/features/history/hooks/useEvents'
import { formatDateTime } from '@/lib/format'

const PAGE_SIZE = 20

const FILTERS: Array<{ value: string; label: string; type: EventType | null }> = [
  { value: 'toate', label: 'Toate', type: null },
  { value: 'prag-sus', label: 'Peste prag', type: 'THRESHOLD_HIGH' },
  { value: 'prag-jos', label: 'Sub prag', type: 'THRESHOLD_LOW' },
  { value: 'offline', label: 'Deconectări', type: 'DEVICE_OFFLINE' },
  { value: 'invalid', label: 'Citiri invalide', type: 'INVALID_READING' },
]

const SEVERITY_LABEL: Record<EventSeverity, string> = {
  INFO: 'Informativ',
  WARNING: 'Atenție',
  CRITICAL: 'Critic',
}

export function HistoryPage() {
  const [filter, setFilter] = useState('toate')
  const [page, setPage] = useState(0)

  const selected = FILTERS.find((entry) => entry.value === filter) ?? FILTERS[0]
  const { data, isPending, isError, error } = useEvents({
    type: selected.type,
    page,
    size: PAGE_SIZE,
  })

  function changeFilter(value: string) {
    setFilter(value)
    setPage(0)
  }

  return (
    <div className="space-y-12">
      <Tabs value={filter} onValueChange={changeFilter}>
        <TabsList>
          {FILTERS.map((entry) => (
            <TabsTrigger key={entry.value} value={entry.value}>
              {entry.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mx-auto grid w-full max-w-5xl gap-6">
        {isError && <ErrorState error={error} />}
        {isPending && Array.from({ length: 4 }, (_, index) => <LoadingCard key={index} />)}
        {data?.items.length === 0 && (
          <EmptyState
            title="Niciun eveniment în această perioadă"
            description="Evenimentele apar când o valoare trece de un prag configurat sau când stația se deconectează."
          />
        )}
        {data?.items.map((event) => (
          <Card key={event.id}>
            <CardContent className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm">{event.message}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatDateTime(event.ts)}
                </p>
              </div>
              <Badge variant={event.severity === 'INFO' ? 'outline' : 'secondary'}>
                {SEVERITY_LABEL[event.severity]}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          >
            <ChevronLeft className="size-4" aria-hidden />
            Anterioare
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            Pagina {data.page + 1} din {data.totalPages} · {data.totalItems} evenimente
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage((current) => current + 1)}
          >
            Următoare
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  )
}
