import type { ReactNode } from 'react'
import { cn } from 'cn'

type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

/**
 * Antetul fiecărei pagini. Există ca să nu existe cinci variante de titlu, cu cinci
 * spațieri diferite — stilul lui `h1` vine din `AppShell`, aici se adaugă doar
 * descrierea și slotul de acțiuni.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-4 pb-2', className)}>
      <div className="space-y-2">
        <h1>{title}</h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
