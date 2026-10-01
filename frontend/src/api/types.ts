/**
 * Contractul API-ului SERA, oglindind DTO-urile din `backend/`.
 *
 * Datele vin de la un backend propriu, autentificat — nu de la o sursă externă —
 * deci tipurile sunt suficiente aici; Zod rămâne pentru intrările de la utilizator.
 */

export type MetricCode =
  | 'TEMP_AIR'
  | 'HUMIDITY_AIR'
  | 'PRESSURE'
  | 'LUX'
  | 'SOIL_MOISTURE'

export type PlantId = 'P1' | 'P2'

export type MetricCatalogEntry = {
  code: MetricCode
  unit: string
  labelRo: string
  perPlant: boolean
  sortOrder: number
}

/**
 * `available: false` înseamnă că nu există nicio citire pentru metrica respectivă,
 * iar `value` este null. Interfața afișează atunci „Indisponibil”, niciodată zero.
 */
export type MetricValue = {
  metric: MetricCode
  unit: string
  labelRo: string
  value: number | null
  measuredAt: string | null
  available: boolean
}

export type PlantTelemetry = {
  plantId: PlantId
  label: string
  available: boolean
  soilMoisture: MetricValue | null
  /** Eticheta de stare recalculată de backend după pragurile din firmware. */
  soilState: string | null
}

export type CurrentTelemetry = {
  generatedAt: string
  deviceOnline: boolean
  greenhouse: MetricValue[]
  plants: PlantTelemetry[]
}

export type SeriesBucket = 'raw' | 'hour'

export type SeriesPoint = {
  ts: string
  value: number
  /** Populate doar pentru bucket-ul orar; null pentru citirile brute. */
  minValue: number | null
  maxValue: number | null
}

export type Series = {
  metric: MetricCode
  plantId: PlantId | null
  unit: string
  labelRo: string
  bucket: SeriesBucket
  from: string
  to: string
  points: SeriesPoint[]
}

export type EventType =
  | 'THRESHOLD_HIGH'
  | 'THRESHOLD_LOW'
  | 'DEVICE_OFFLINE'
  | 'DEVICE_ONLINE'
  | 'INVALID_READING'

export type EventSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export type SeraEvent = {
  id: number
  ts: string
  type: EventType
  severity: EventSeverity
  metric: MetricCode | null
  plantId: PlantId | null
  value: number | null
  message: string
}

export type EventPage = {
  items: SeraEvent[]
  page: number
  size: number
  totalItems: number
  totalPages: number
}

export type DeviceStatus = {
  online: boolean
  /** null înseamnă că nu a sosit niciodată un mesaj, nu că device-ul tocmai a picat. */
  lastSeen: string | null
  secondsSinceLastSeen: number | null
  reportedReadIntervalSecond: number
  offlineAfterSecond: number
}

export type Threshold = {
  id: number
  metric: MetricCode
  plantId: PlantId | null
  labelRo: string
  unit: string
  minValue: number | null
  maxValue: number | null
  enabled: boolean
}

export type Settings = {
  name: string
  description: string | null
  readIntervalSecond: number
  updatedAt: string
  thresholds: Threshold[]
}

export type UpdateSettingsPayload = {
  name: string
  description: string | null
  readIntervalSecond: number
  thresholds: Array<{
    id: number
    minValue: number | null
    maxValue: number | null
    enabled: boolean
  }>
}
