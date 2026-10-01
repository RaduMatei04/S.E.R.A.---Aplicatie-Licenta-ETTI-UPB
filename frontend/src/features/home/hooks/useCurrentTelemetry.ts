import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import type { CurrentTelemetry } from '@/api/types'

/**
 * Valorile curente. În mod normal cache-ul este actualizat de WebSocket la fiecare
 * citire; reinterogarea la 30 de secunde există doar pentru cazul în care conexiunea
 * live nu se poate stabili.
 */
export function useCurrentTelemetry() {
  return useQuery({
    queryKey: queryKeys.telemetry.current(),
    queryFn: () => api.get<CurrentTelemetry>('/api/v1/telemetry/current'),
    refetchInterval: 30_000,
  })
}
