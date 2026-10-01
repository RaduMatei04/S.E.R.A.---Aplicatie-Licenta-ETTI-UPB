import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MetricCode, PlantId, SeriesBucket } from '@/api/types'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTelemetrySeries } from '@/features/charts/hooks/useTelemetrySeries'
import { formatDateTime, formatTime } from '@/lib/format'

type MetricChartProps = {
  metric: MetricCode
  plantId?: PlantId | null
  title: string
  from: string
  to: string
  bucket: SeriesBucket
}

/**
 * Un grafic de evoluție.
 *
 * Linia folosește `--accent-color`, culoarea aleasă de utilizator, nu `--chart-1`:
 * acesta din urmă este un gri neutru în tema SERA, deci graficele ar fi ieșit complet
 * decolorate. Restul cromaticii (grilă, axe, tooltip) rămâne pe tokenii neutri.
 */
export function MetricChart({ metric, plantId = null, title, from, to, bucket }: MetricChartProps) {
  const { data, isPending, isError, error } = useTelemetrySeries({ metric, plantId, from, to, bucket })

  if (isError) {
    return <ErrorState title={`${title} nu a putut fi încărcat`} error={error} />
  }

  const points = (data?.points ?? []).map((point) => ({
    ts: point.ts,
    value: point.value,
  }))

  return (
    <Card className="min-h-80">
      <CardHeader>
        <CardTitle className="flex items-baseline justify-between gap-2 text-sm font-medium">
          {title}
          {data && <span className="text-xs font-normal text-muted-foreground">{data.unit}</span>}
        </CardTitle>
      </CardHeader>

      <CardContent className="h-64">
        {isPending && <div className="size-full animate-pulse rounded-md bg-muted" />}

        {!isPending && points.length === 0 && (
          <div className="flex size-full items-center justify-center text-center text-xs text-muted-foreground">
            Nu există date salvate în intervalul selectat.
          </div>
        )}

        {!isPending && points.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id={`fill-${metric}-${plantId ?? 'all'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-color)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--accent-color)" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="ts"
                tickFormatter={formatTime}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                width={48}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                labelFormatter={(value) => formatDateTime(String(value))}
                formatter={(value) => [`${String(value)} ${data?.unit ?? ''}`, data?.labelRo ?? '']}
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem',
                  color: 'var(--popover-foreground)',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--accent-color)"
                strokeWidth={2}
                fill={`url(#fill-${metric}-${plantId ?? 'all'})`}
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
