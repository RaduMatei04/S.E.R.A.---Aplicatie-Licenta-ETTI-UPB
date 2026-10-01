import type { LucideIcon } from 'lucide-react'
import { cn } from 'cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type SkillLevel = 1 | 2 | 3

type SkillCardProps = {
  icon: LucideIcon
  name: string
  level: SkillLevel
  levelLabel: string
  description: string
}

const SEGMENTS: SkillLevel[] = [1, 2, 3]

/**
 * O competență, cu nivelul desenat ca trei segmente.
 *
 * Segmentele sunt elemente stilizate, nu un `<progress>` nativ: elementele native de
 * formular își impun propriul aspect, diferit de la browser la browser, și ar strica
 * unitatea vizuală a paginii.
 */
export function SkillCard({ icon: Icon, name, level, levelLabel, description }: SkillCardProps) {
  return (
    <Card className="group/skill min-h-44 justify-between ring-brand/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand/5 hover:shadow-lg hover:shadow-brand/20 hover:ring-2 hover:ring-brand/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium">
          <Icon className="size-4.5 text-brand" aria-hidden />
          {name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div
            className="flex gap-1.5"
            role="img"
            aria-label={`${name}: nivel ${levelLabel}`}
          >
            {SEGMENTS.map((segment) => (
              <span
                key={segment}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  segment <= level
                    ? 'bg-brand group-hover/skill:bg-brand'
                    : 'bg-muted group-hover/skill:bg-brand/20',
                )}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-brand">{levelLabel}</p>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
