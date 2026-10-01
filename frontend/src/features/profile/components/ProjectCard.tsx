import { Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from 'cn'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GithubMark } from '@/features/profile/components/BrandIcons'

export type Project = {
  name: string
  icon: LucideIcon
  description: string
  tags: string[]
  /** Lipsește pentru proiectele care nu sunt publicate pe GitHub. */
  url?: string
  stars?: number
  featured?: boolean
}

/**
 * Un proiect. Cardul devine în întregime clickabil când există un link public, deci
 * este randat ca ancoră — un card cu `onClick` nu poate fi deschis cu tastatura și nu
 * oferă adresa la hover, cum face un link adevărat.
 */
export function ProjectCard({ project }: { project: Project }) {
  const { name, icon: Icon, description, tags, url, stars, featured } = project

  const content = (
    <Card
      className={cn(
        'group/project h-full justify-between transition-all duration-200',
        featured ? 'ring-2 ring-brand/50' : 'ring-brand/30',
        url &&
          'hover:-translate-y-0.5 hover:bg-brand/5 hover:shadow-xl hover:shadow-brand/25 hover:ring-2 hover:ring-brand/80',
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-3 text-sm font-medium">
          <span className="flex items-center gap-2.5">
            <Icon className="size-4.5 shrink-0 text-brand" aria-hidden />
            {name}
          </span>
          {stars !== undefined && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-normal text-brand tabular-nums">
              <Star className="size-3.5 fill-current" aria-hidden />
              {stars}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-brand/40 text-brand transition-colors group-hover/project:border-brand group-hover/project:bg-brand/10"
            >
              {tag}
            </Badge>
          ))}
          {url && (
            <GithubMark className="ml-auto size-4 text-muted-foreground transition-colors group-hover/project:text-brand" />
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (!url) {
    return content
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`${name} — deschide pe GitHub`}
    >
      {content}
    </a>
  )
}
