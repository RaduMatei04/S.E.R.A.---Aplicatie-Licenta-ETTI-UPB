import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { accents, accentSchema, colorModeSchema } from '../theme.config'
import { useTheme } from '../useTheme'
import { cn } from '@/lib/utils';

export function ThemePopover() {
  const { accent, colorMode, setAccent, setColorMode } = useTheme()

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" className="h-10 px-3 text-xs tracking-wide" />}>
        TEMĂ

      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="max-w-[calc(100vw-2rem)] gap-5 p-4">
        <PopoverTitle className="sr-only">Tema</PopoverTitle>
        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground">CULOARE ACCENT</legend>
          <div className="grid grid-cols-2 gap-2">
            {accentSchema.options.map((value) => (
              <Button
                key={value}
                variant="ghost"
                aria-pressed={accent === value}
                onClick={() => setAccent(value)}
                className={cn(
  "h-10 justify-start border-2 px-5",
  accent === value ? "border-brand" : "border-border"
)}
              >
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: accents[value].color }} />
                {accents[value].label}
              
              </Button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground">ASPECT</legend>
          <div className="grid grid-cols-2 gap-2">
            {colorModeSchema.options.map((value) => (
              <Button
                key={value}
                variant="ghost"
                aria-pressed={colorMode === value}
                onClick={() => setColorMode(value)}
                className={cn(
  "h-10 border-2",
  colorMode === value ? "border-brand" : "border-border"
)}
              >
                {value === 'light' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
                {value === 'light' ? 'Luminos' : 'Întunecat'}
                
              </Button>
            ))}
          </div>
        </fieldset>
      </PopoverContent>
    </Popover>
  )
}
