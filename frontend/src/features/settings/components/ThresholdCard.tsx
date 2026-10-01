import type { Threshold } from '@/api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type ThresholdDraft = {
  minValue: string
  maxValue: string
  enabled: boolean
}

type ThresholdCardProps = {
  threshold: Threshold
  draft: ThresholdDraft
  error?: string
  onChange: (next: ThresholdDraft) => void
}

/**
 * Un prag de alertă. Valorile se țin ca text în timpul editării: altfel câmpul golit
 * ar deveni imediat 0 și ar declanșa alerte false.
 */
export function ThresholdCard({ threshold, draft, error, onChange }: ThresholdCardProps) {
  const title = threshold.plantId
    ? `${threshold.labelRo} · planta ${threshold.plantId.slice(1)}`
    : threshold.labelRo
  const fieldId = `threshold-${threshold.id}`

  return (
    <Card className="min-h-36">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 text-sm font-medium">
          {title}
          <label className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 accent-[var(--accent-color)]"
              checked={draft.enabled}
              onChange={(event) => onChange({ ...draft, enabled: event.target.checked })}
            />
            Activ
          </label>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-min`} className="text-xs text-muted-foreground">
              Minim ({threshold.unit})
            </Label>
            <Input
              id={`${fieldId}-min`}
              inputMode="decimal"
              className="tabular-nums"
              value={draft.minValue}
              disabled={!draft.enabled}
              onChange={(event) => onChange({ ...draft, minValue: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-max`} className="text-xs text-muted-foreground">
              Maxim ({threshold.unit})
            </Label>
            <Input
              id={`${fieldId}-max`}
              inputMode="decimal"
              className="tabular-nums"
              value={draft.maxValue}
              disabled={!draft.enabled}
              onChange={(event) => onChange({ ...draft, maxValue: event.target.value })}
            />
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
