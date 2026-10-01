import { cn } from 'cn'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Schelet cu exact dimensiunile unui card de valoare, ca încărcarea să nu schimbe
 * înălțimea rândurilor din grilă.
 */
export function LoadingCard({ className }: { className?: string }) {
  return (
    <Card className={cn('min-h-36 justify-between', className)} aria-busy="true">
      <CardHeader>
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
