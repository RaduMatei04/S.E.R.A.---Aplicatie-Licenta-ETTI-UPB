import { Gauge, Droplets, Sprout, Sun, Thermometer } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { MetricCode } from '@/api/types'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingCard } from '@/components/feedback/LoadingCard'
import { PageSection } from '@/components/layout/PageSection'
import { MetricCard } from '@/components/ui/metric-card'
import { DeviceStatusBadge } from '@/features/status/components/DeviceStatusBadge'
import { useCurrentTelemetry } from '@/features/home/hooks/useCurrentTelemetry'
import { formatRelative } from '@/lib/format'

const ICONS: Record<MetricCode, LucideIcon> = {
  TEMP_AIR: Thermometer,
  HUMIDITY_AIR: Droplets,
  PRESSURE: Gauge,
  LUX: Sun,
  SOIL_MOISTURE: Sprout,
}

/** Lumina și presiunea nu au nevoie de zecimale; temperatura și umiditatea, da. */
const FRACTION_DIGITS: Partial<Record<MetricCode, number>> = {
  LUX: 0,
  PRESSURE: 0,
  SOIL_MOISTURE: 0,
}

export function HomePage() {
  const { data, isPending, isError, error } = useCurrentTelemetry()

  return (
    <div className="space-y-12">
      {isError && <ErrorState error={error} />}

      <PageSection
        title="Mediul serei"
        description="Măsurate de senzorii comuni: BME280 și BH1750."
        columns={4}
        action={<DeviceStatusBadge />}
      >
        {isPending
          ? Array.from({ length: 4 }, (_, index) => <LoadingCard key={index} />)
          : (data?.greenhouse ?? []).map((metric) => (
              <MetricCard
                key={metric.metric}
                label={metric.labelRo}
                value={metric.value}
                unit={metric.unit}
                icon={ICONS[metric.metric]}
                caption={formatRelative(metric.measuredAt)}
                unavailable={!metric.available}
                unavailableReason="Senzor fără date"
                fractionDigits={FRACTION_DIGITS[metric.metric] ?? 1}
              />
            ))}
      </PageSection>

      <PageSection
        title="Plante"
        description="Umiditatea solului, măsurată separat pentru fiecare plantă."
        columns={2}
      >
        {isPending
          ? Array.from({ length: 2 }, (_, index) => <LoadingCard key={index} />)
          : (data?.plants ?? []).map((plant) => (
              <MetricCard
                key={plant.plantId}
                label={plant.label}
                value={plant.soilMoisture?.value ?? null}
                unit={plant.soilMoisture?.unit}
                icon={ICONS.SOIL_MOISTURE}
                caption={plant.soilState}
                unavailable={!plant.available}
                unavailableReason="Senzor fără date"
                fractionDigits={0}
              />
            ))}
      </PageSection>
    </div>
  )
}
