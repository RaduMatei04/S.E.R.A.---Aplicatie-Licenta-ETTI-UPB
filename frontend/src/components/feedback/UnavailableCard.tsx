import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type UnavailableCardProps = {
  label: string
  icon?: LucideIcon
  reason?: string
}

/**
 * Card pentru hardware care încă nu există — actuatoarele nu sunt montate.
 *
 * Structura rămâne la locul ei, ca să fie evident ce lipsește și ca pagina să fie gata
 * când echipamentul apare. Nu se afișează valori plauzibile și nu se ascunde secțiunea.
 */
export function UnavailableCard({
  label,
  icon: Icon,
  reason = 'Hardware nemontat',
}: UnavailableCardProps) {
  return (
    <Card className="min-h-40 justify-between opacity-60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
          {Icon && <Icon className="size-4" aria-hidden />}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <Badge variant="outline" className="text-muted-foreground">
          Indisponibil
        </Badge>
        <p className="text-xs text-muted-foreground">{reason}</p>
      </CardContent>
    </Card>
  )
}
