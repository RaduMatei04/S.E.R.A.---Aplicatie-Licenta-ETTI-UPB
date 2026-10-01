import type { ReactNode } from 'react'
import { cn } from 'cn'

type PageSectionProps = {
  title?: string
  description?: string
  /** Numărul de coloane pe ecran lat. Pe mobil secțiunea are mereu o coloană. */
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
 * la aceeași distanță indiferent de pagină.
 *
 * Numărul de coloane vine explicit de la apelant, nu din numărarea copiilor: un fragment
 * care conține trei carduri se numără ca un singur copil, iar secțiunea ar ajunge să le
 * așeze pe verticală fără niciun motiv vizibil în codul paginii.
 *
 * Lățimea maximă pe coloane puține ține grila centrată: două carduri stau în mijloc, nu
 * lipite în stânga cu un gol mare în dreapta.
 */

const GRID_BY_COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
}

const MAX_WIDTH_BY_COLUMNS: Record<number, string> = {
  1: 'max-w-xl',
  2: 'max-w-4xl',
  3: 'max-w-6xl',
  4: '',
}

/**
 * Pe două coloane, un număr impar de carduri lasă ultimul singur, lipit în stânga.
 * Regula îl întinde peste ambele coloane, îi redă lățimea unei singure coloane și îl
 * centrează. Se bazează pe poziția în grilă, nu pe numărarea copiilor în JavaScript,
 * deci funcționează și când cardurile vin dintr-o listă de lungime variabilă.
 */
const CENTER_LONE_CARD = [
  'sm:[&>*:last-child:nth-child(odd)]:col-span-2',
  'sm:[&>*:last-child:nth-child(odd)]:mx-auto',
  'sm:[&>*:last-child:nth-child(odd)]:w-[calc(50%-1rem)]',
].join(' ')

export function PageSection({
  title,
  description,
  columns = 4,
  action,
  wide = false,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn('space-y-7', className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            {title && (
              <h2 className="flex items-center gap-2.5 font-heading text-lg font-medium tracking-tight">
                {/* Bară de accent: păstrează culoarea aleasă de utilizator prezentă pe pagină, discret. */}
                <span aria-hidden className="h-4 w-1 rounded-full bg-brand" />
                {title}
              </h2>
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
          'mx-auto grid w-full gap-8',
          GRID_BY_COLUMNS[columns],
          columns === 2 && CENTER_LONE_CARD,
          !wide && MAX_WIDTH_BY_COLUMNS[columns],
        )}
      >
        {children}
      </div>
    </section>
  )
}
