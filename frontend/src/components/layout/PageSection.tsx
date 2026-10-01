import { Children, type ReactNode } from 'react'
import { cn } from 'cn'

type PageSectionProps = {
  title?: string
  description?: string
  /** Numărul maxim de coloane pe ecran lat. Pe mobil secțiunea are mereu o coloană. */
  columns?: 1 | 2 | 3 | 4
  action?: ReactNode
  /** Renunță la lățimea maximă: pentru conținut care are nevoie de spațiu, ca graficele. */
  wide?: boolean
  children: ReactNode
  className?: string
}

/**
 * Grila standard de carduri.
 *
 * Toate paginile folosesc aceeași secțiune, deci cardurile cad pe aceleași coloane și
 * la aceeași distanță indiferent de pagină. Când sunt mai puține carduri decât coloane,
 * grila primește o lățime maximă proprie și se centrează — altfel două carduri ar sta
 * înghesuite în stânga, cu un gol mare în dreapta.
 */

const GRID_BY_COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
}

const MAX_WIDTH_BY_COLUMNS: Record<number, string> = {
  1: 'max-w-md',
  2: 'max-w-3xl',
  3: 'max-w-5xl',
  4: '',
}

export function PageSection({
  title,
  description,
  columns = 4,
  action,
  wide = false,
  children,
  className,
}: PageSectionProps) {
  const count = Children.count(children)
  const effectiveColumns = Math.min(count || 1, columns)

  return (
    <section className={cn('space-y-4', className)}>
      {(title || action) && (
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className="font-heading text-lg font-medium tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}

      <div
        className={cn(
          'mx-auto grid w-full gap-6',
          GRID_BY_COLUMNS[effectiveColumns],
          !wide && MAX_WIDTH_BY_COLUMNS[effectiveColumns],
        )}
      >
        {children}
      </div>
    </section>
  )
}
