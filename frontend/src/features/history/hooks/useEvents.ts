import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import type { EventPage, EventType } from '@/api/types'

type EventFilters = {
  type?: EventType | null
  page: number
  size: number
}

export function useEvents(filters: EventFilters) {
  return useQuery({
    queryKey: queryKeys.events.page(filters),
    queryFn: () =>
      api.get<EventPage>('/api/v1/events', {
        type: filters.type ?? null,
        page: filters.page,
        size: filters.size,
      }),
    // Păstrează pagina anterioară vizibilă cât se încarcă următoarea, ca lista să nu
    // dispară și layout-ul să nu sară la fiecare schimbare de filtru.
    placeholderData: keepPreviousData,
  })
}
