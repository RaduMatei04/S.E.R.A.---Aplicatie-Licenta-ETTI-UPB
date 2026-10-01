import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import type { MetricCatalogEntry } from '@/api/types'

/**
 * Unitățile și etichetele metricilor. Catalogul este fix (populat de migrarea bazei),
 * deci se încarcă o dată și nu expiră — interfața nu hardcodează „°C” sau „hPa”.
 */
export function useMetricCatalog() {
  return useQuery({
    queryKey: queryKeys.metrics.catalog,
    queryFn: () => api.get<MetricCatalogEntry[]>('/api/v1/metrics/catalog'),
    staleTime: Infinity,
  })
}
