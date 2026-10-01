import type { LucideIcon } from 'lucide-react'
import { cn } from 'cn'
import { Card, CardContent } from '@/components/ui/card'

type StateCardProps = {
  icon?: LucideIcon
  title: string
  description?: string
  /** Ocupă toate coloanele grilei, pentru stările care țin locul întregii secțiuni. */
  fullWidth?: boolean
  className?: string
}

/**
 * Bază comună pentru stările de încărcare, eroare, gol și indisponibil.
 *
 * Toate au aceeași înălțime minimă ca un card de valoare, ca trecerea dintr-o stare în
 * alta să nu modifice înălțimea rândului și să nu facă pagina să salte.
 */
export function StateCard({ icon: Icon, title, description, fullWidth, className }: StateCardProps) {
  return (
    <Card className={cn('min-h-40 justify-center', fullWidth && 'col-span-full', className)}>
      <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
        {Icon && <Icon className="size-5 text-muted-foreground" aria-hidden />}
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
