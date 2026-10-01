import type { LucideIcon } from 'lucide-react'
import { cn } from 'cn'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type MetricCardProps = {
  label: string
  value: number | null
  unit?: string
  icon?: LucideIcon
  /** Text sub valoare: eticheta de stare a solului sau momentul citirii. */
  caption?: string | null
  /** Hardware nemontat sau senzor care nu a raportat niciodată. */
  unavailable?: boolean
  unavailableReason?: string
  /** Zecimalele afișate; lumina se rotunjește la întreg, temperatura la o zecimală. */
  fractionDigits?: number
  className?: string
}

/**
 * Cardul de valoare măsurată.
 *
 * Două detalii nu sunt cosmetice: înălțimea minimă egală ține rândurile grilei
 * aliniate chiar dacă un senzor lipsește, iar `tabular-nums` fixează lățimea cifrelor
 * — fără el, valoarea își schimbă lățimea la fiecare actualizare și cardul tremură
 * vizibil, pentru că datele sosesc o dată pe secundă.
 */
export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  caption,
  unavailable = false,
  unavailableReason = 'Indisponibil',
  fractionDigits = 1,
  className,
}: MetricCardProps) {
  const missing = unavailable || value === null

  return (
    <Card
      className={cn(
        'min-h-40 justify-between transition-[box-shadow,opacity] hover:ring-brand/45',
        missing && 'opacity-60',
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
          {Icon && <Icon className="size-4 text-brand" aria-hidden />}
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1.5">
        {missing ? (
          <Badge variant="outline" className="text-muted-foreground">
            {unavailableReason}
          </Badge>
        ) : (
          <>
            <p className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {value.toFixed(fractionDigits)}
              </span>
              {unit && <span className="text-base text-muted-foreground">{unit}</span>}
            </p>
            {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
