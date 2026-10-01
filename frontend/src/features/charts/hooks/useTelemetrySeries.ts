import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import type { MetricCode, PlantId, Series, SeriesBucket } from '@/api/types'

type SeriesParams = {
  metric: MetricCode
  plantId?: PlantId | null
  from: string
  to: string
  bucket: SeriesBucket
}

export function useTelemetrySeries({ metric, plantId = null, from, to, bucket }: SeriesParams) {
  return useQuery({
    queryKey: queryKeys.telemetry.series(metric, plantId, bucket, from, to),
    queryFn: () =>
      api.get<Series>('/api/v1/telemetry/series', {
        metric,
        plantId,
        from,
        to,
        bucket: bucket.toUpperCase(),
      }),
  })
}
