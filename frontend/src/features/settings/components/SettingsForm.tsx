import { useState } from 'react'
import { Check, Clock, Radio } from 'lucide-react'
import type { Settings } from '@/api/types'
import { ErrorState } from '@/components/feedback/ErrorState'
import { PageSection } from '@/components/layout/PageSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThresholdCard, type ThresholdDraft } from '@/features/settings/components/ThresholdCard'
import { useUpdateSettings } from '@/features/settings/hooks/useSettings'
import { collectErrors, settingsSchema } from '@/features/settings/schema'
import { useDeviceStatus } from '@/hooks/useDeviceStatus'
import { formatDateTime, formatDuration } from '@/lib/format'

/**
 * Formularul de setări.
 *
 * Starea se inițializează o singură dată, din `settings`. Componenta este montată cu
 * `key={settings.updatedAt}`, deci o salvare reușită o remontează cu valorile noi —
 * fără a sincroniza state-ul dintr-un efect, care ar suprascrie ce tocmai a tastat
 * utilizatorul dacă datele s-ar reîmprospăta între timp.
 */
export function SettingsForm({ settings }: { settings: Settings }) {
  const device = useDeviceStatus()
  const update = useUpdateSettings()

  const [name, setName] = useState(settings.name)
  const [description, setDescription] = useState(settings.description ?? '')
  const [drafts, setDrafts] = useState<Record<number, ThresholdDraft>>(() =>
    Object.fromEntries(
      settings.thresholds.map((threshold) => [
        threshold.id,
        {
          minValue: threshold.minValue?.toString() ?? '',
          maxValue: threshold.maxValue?.toString() ?? '',
          enabled: threshold.enabled,
        },
      ]),
    ),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const parsed = settingsSchema.safeParse({
      name,
      description,
      thresholds: settings.thresholds.map((threshold) => ({
        id: threshold.id,
        ...drafts[threshold.id],
      })),
    })

    if (!parsed.success) {
      setErrors(collectErrors(parsed.error, settings.thresholds.map((threshold) => threshold.id)))
      return
    }

    setErrors({})
    update.mutate({
      name: parsed.data.name,
      description: parsed.data.description || null,
      readIntervalSecond: settings.readIntervalSecond,
      thresholds: parsed.data.thresholds,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <PageSection
        title="Identitatea serei"
        description="Pragurile de mai jos sunt folosite doar pentru alerte; nimic nu se trimite către stația de senzori."
        columns={2}
        action={
          <Button type="submit" disabled={update.isPending}>
            {update.isSuccess && !update.isPending && <Check className="size-4" aria-hidden />}
            {update.isPending ? 'Se salvează…' : 'Salvează'}
          </Button>
        }
      >
        <Card className="min-h-40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Nume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Label htmlFor="greenhouse-name" className="sr-only">
              Numele serei
            </Label>
            <Input
              id="greenhouse-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </CardContent>
        </Card>

        <Card className="min-h-40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Descriere</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Label htmlFor="greenhouse-description" className="sr-only">
              Descrierea serei
            </Label>
            <Input
              id="greenhouse-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </CardContent>
        </Card>
      </PageSection>

      <PageSection
        title="Praguri de alertă"
        description="O alertă se înregistrează o singură dată, când valoarea trece pragul — nu la fiecare citire."
        columns={3}
      >
        {settings.thresholds.map((threshold) => (
          <ThresholdCard
            key={threshold.id}
            threshold={threshold}
            draft={drafts[threshold.id] ?? { minValue: '', maxValue: '', enabled: false }}
            error={errors[`threshold-${threshold.id}`]}
            onChange={(next) => setDrafts((current) => ({ ...current, [threshold.id]: next }))}
          />
        ))}
      </PageSection>

      <PageSection
        title="Stația de senzori"
        description="Informații raportate de echipament. Nu pot fi modificate din aplicație."
        columns={2}
      >
        <Card className="min-h-40 justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <Clock className="size-4 text-brand" aria-hidden />
              Interval de raportare
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <p className="text-xl font-semibold tabular-nums">{settings.readIntervalSecond} s</p>
            <p className="text-xs text-muted-foreground">
              Ultima modificare a setărilor: {formatDateTime(settings.updatedAt)}
            </p>
          </CardContent>
        </Card>

        <Card className="min-h-40 justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <Radio className="size-4 text-brand" aria-hidden />
              Conexiune
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <p className="text-xl font-semibold">{device.data?.online ? 'Online' : 'Offline'}</p>
            <p className="text-xs text-muted-foreground">
              {formatDuration(device.data?.secondsSinceLastSeen)
                ? `Ultimul mesaj acum ${formatDuration(device.data?.secondsSinceLastSeen)}`
                : 'Nu a sosit încă niciun mesaj.'}
            </p>
          </CardContent>
        </Card>
      </PageSection>

      {update.isError && (
        <ErrorState title="Setările nu au putut fi salvate" error={update.error} />
      )}
    </form>
  )
}
