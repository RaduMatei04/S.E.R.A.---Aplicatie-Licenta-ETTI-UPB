import { useMemo, useState } from 'react'
import type { MetricCode, SeriesBucket } from '@/api/types'
import { ErrorState } from '@/components/feedback/ErrorState'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSection } from '@/components/layout/PageSection'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricChart } from '@/features/charts/components/MetricChart'
import { useMetricCatalog } from '@/hooks/useMetricCatalog'

/**
 * Intervalele oferite. Pentru 24 de ore se citesc măsurătorile brute; peste atât se
 * trece pe agregatele orare, altfel graficul ar încărca zeci de mii de puncte pe care
 * ecranul oricum nu le poate distinge.
 */
const RANGES = [
  { value: '24h', label: '24 de ore', hours: 24, bucket: 'raw' as SeriesBucket },
  { value: '7z', label: '7 zile', hours: 24 * 7, bucket: 'hour' as SeriesBucket },
  { value: '30z', label: '30 de zile', hours: 24 * 30, bucket: 'hour' as SeriesBucket },
]

export function ChartsPage() {
  const catalog = useMetricCatalog()
  const [metric, setMetric] = useState<MetricCode>('TEMP_AIR')
  const [range, setRange] = useState('24h')

  const selectedRange = RANGES.find((entry) => entry.value === range) ?? RANGES[0]

  // Capetele intervalului se recalculează doar la schimbarea selecției: dacă ar fi
  // recalculate la fiecare randare, cheia de cache s-ar schimba continuu și graficul
  // s-ar reîncărca la infinit.
  const { from, to } = useMemo(() => {
    const end = new Date()
    const start = new Date(end.getTime() - selectedRange.hours * 3_600_000)
    return { from: start.toISOString(), to: end.toISOString() }
  }, [selectedRange.hours])

  const selected = catalog.data?.find((entry) => entry.code === metric)
  const isPerPlant = selected?.perPlant ?? false

  return (
    <div className="space-y-8">
      <PageHeader
        title="GRAFICE"
        description="Evoluția în timp a valorilor măsurate în seră."
      />

      {catalog.isError && <ErrorState error={catalog.error} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={metric} onValueChange={(value) => setMetric(value as MetricCode)}>
          <TabsList>
            {(catalog.data ?? []).map((entry) => (
              <TabsTrigger key={entry.code} value={entry.code}>
                {entry.labelRo}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {RANGES.map((entry) => (
            <Button
              key={entry.value}
              type="button"
              size="sm"
              variant={entry.value === range ? 'default' : 'outline'}
              onClick={() => setRange(entry.value)}
            >
              {entry.label}
            </Button>
          ))}
        </div>
      </div>

      <PageSection columns={isPerPlant ? 2 : 1} wide>
        {isPerPlant ? (
          <>
            <MetricChart
              metric={metric}
              plantId="P1"
              title={`${selected?.labelRo ?? ''} · planta 1`}
              from={from}
              to={to}
              bucket={selectedRange.bucket}
            />
            <MetricChart
              metric={metric}
              plantId="P2"
              title={`${selected?.labelRo ?? ''} · planta 2`}
              from={from}
              to={to}
              bucket={selectedRange.bucket}
            />
          </>
        ) : (
          <MetricChart
            metric={metric}
            title={selected?.labelRo ?? ''}
            from={from}
            to={to}
            bucket={selectedRange.bucket}
          />
        )}
      </PageSection>
    </div>
  )
}
