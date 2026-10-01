import type { MetricCode, PlantId, SeriesBucket } from '@/api/types'

/**
 * Chei ierarhice pentru TanStack Query: invalidarea unui prefix invalidează tot ce
 * atârnă sub el, deci un mesaj WebSocket poate împrospăta exact cât trebuie.
 */
export const queryKeys = {
  telemetry: {
    all: ['telemetry'] as const,
    current: () => [...queryKeys.telemetry.all, 'current'] as const,
    series: (metric: MetricCode, plantId: PlantId | null, bucket: SeriesBucket, from: string, to: string) =>
      [...queryKeys.telemetry.all, 'series', metric, plantId, bucket, from, to] as const,
  },
  metrics: {
    catalog: ['metrics', 'catalog'] as const,
  },
  events: {
    all: ['events'] as const,
    page: (filters: Record<string, unknown>) => [...queryKeys.events.all, filters] as const,
  },
  device: {
    status: ['device', 'status'] as const,
  },
  settings: {
    all: ['settings'] as const,
  },
} as const
