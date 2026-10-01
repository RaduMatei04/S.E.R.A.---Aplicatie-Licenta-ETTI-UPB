import { Activity, Clock, Fan, Radio, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingCard } from '@/components/feedback/LoadingCard'
import { UnavailableCard } from '@/components/feedback/UnavailableCard'
import { PageSection } from '@/components/layout/PageSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeviceStatusBadge } from '@/features/status/components/DeviceStatusBadge'
import { useCurrentTelemetry } from '@/features/home/hooks/useCurrentTelemetry'
import { useDeviceStatus } from '@/hooks/useDeviceStatus'
import { formatDateTime, formatDuration } from '@/lib/format'

/**
 * Starea sistemului.
 *
 * Actuatoarele (pompa și ventilatorul) nu sunt montate, deci nu au nici endpoint în
 * API, nici valori aici: apar ca plăci marcate explicit indisponibile. Restul paginii
 * arată ce se poate ști cu adevărat — starea stației și ce senzori raportează.
 */
export function StatusPage() {
  const device = useDeviceStatus()
  const telemetry = useCurrentTelemetry()

  const activeSensors = telemetry.data
    ? telemetry.data.greenhouse.filter((metric) => metric.available).length +
      telemetry.data.plants.filter((plant) => plant.available).length
    : 0
  const totalSensors = telemetry.data
    ? telemetry.data.greenhouse.length + telemetry.data.plants.length
    : 0

  return (
    <div className="space-y-12">
      {device.isError && <ErrorState error={device.error} />}

      <PageSection
        title="Stația de senzori"
        columns={3}
        action={<DeviceStatusBadge />}
      >
        {device.isPending ? (
          Array.from({ length: 3 }, (_, index) => <LoadingCard key={index} />)
        ) : (
          <>
            <InfoCard
              icon={Radio}
              title="Conexiune"
              value={device.data?.online ? 'Online' : 'Offline'}
              caption={
                device.data?.online
                  ? 'Mesajele sosesc în mod normal.'
                  : `Fără mesaje de peste ${device.data?.offlineAfterSecond ?? 0} secunde.`
              }
            />
            <InfoCard
              icon={Clock}
              title="Ultima recepție"
              value={
                device.data?.lastSeen ? formatDateTime(device.data.lastSeen) : 'Niciodată'
              }
              caption={
                formatDuration(device.data?.secondsSinceLastSeen)
                  ? `Acum ${formatDuration(device.data?.secondsSinceLastSeen)}`
                  : 'Nu a sosit încă niciun mesaj.'
              }
            />
            <InfoCard
              icon={Activity}
              title="Senzori activi"
              value={`${activeSensors} din ${totalSensors}`}
              caption="Un senzor fără date nu raportează deloc, nu raportează zero."
            />
          </>
        )}
      </PageSection>

      <PageSection
        title="Actuatoare"
        description="Echipamentele de acționare nu sunt încă instalate în seră."
        columns={2}
      >
        <UnavailableCard label="Pompă de apă" icon={Waves} />
        <UnavailableCard label="Ventilator" icon={Fan} />
      </PageSection>
    </div>
  )
}

type InfoCardProps = {
  icon: LucideIcon
  title: string
  value: string
  caption: string
}

function InfoCard({ icon: Icon, title, value, caption }: InfoCardProps) {
  return (
    <Card className="min-h-40 justify-between">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
          <Icon className="size-4 text-brand" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <p className="text-xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  )
}
