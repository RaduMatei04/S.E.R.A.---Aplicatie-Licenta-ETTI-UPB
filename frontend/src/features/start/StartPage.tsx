import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { accents, accentSchema, type Accent } from '@/features/theme/theme.config'
import { ParticleBackground } from './components/ParticleBackground'

const particleColorOrder = ['brad', 'iris', 'trandafir', 'lavanda'] as const
const particleColorStorageKey = 'sera-start-particle-color'

function restoreParticleColor(): Accent {
  try {
    const result = accentSchema.safeParse(window.localStorage.getItem(particleColorStorageKey))
    return result.success ? result.data : 'brad'
  } catch {
    console.warn('SERA: cannot read start particle color; using Brad.')
    return 'brad'
  }
}

export function StartPage() {
  const [particleColor, setParticleColor] = useState(restoreParticleColor)

  function cycleParticleColor() {
    const nextColor = particleColorOrder[(particleColorOrder.indexOf(particleColor) + 1) % particleColorOrder.length]
    setParticleColor(nextColor)
    try {
      window.localStorage.setItem(particleColorStorageKey, nextColor)
    } catch {
      console.warn('SERA: cannot persist start particle color; selection remains active for this session.')
    }
  }

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#080b0a] px-6 text-white [color-scheme:dark] sm:px-10">
      <ParticleBackground color={accents[particleColor].color} />
      <Button size="sm" onClick={cycleParticleColor} className="absolute right-6 top-6 z-20 bg-white text-neutral-950 hover:bg-white/90 focus-visible:border-white focus-visible:ring-white/60 motion-reduce:transition-none sm:right-10 sm:top-10">
        Culoare
      </Button>
      <section aria-labelledby="start-title" className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-20 text-center sm:py-24">
        <img src="/logo_auth.png" alt="Sigla SERA: o frunză albă cu circuite electronice" width={80} height={120} className="mb-7 h-24 w-16 object-contain sm:h-28 sm:w-20" />
        <h1 id="start-title" className="text-7xl font-semibold tracking-[0.14em] sm:text-8xl lg:text-9xl">SERA</h1>
        <p className="mt-6 max-w-2xl text-xl font-medium leading-relaxed text-white/90 sm:text-2xl">
          Sistem Electronic de Reglare și Automatizare
        </p>
        <p className="mt-5 max-w-lg text-base leading-7 text-white/60 sm:text-lg">
          Platformă pentru monitorizarea și configurarea unei sere inteligente.
        </p>
        <Button render={<Link to="/acasa" />} nativeButton={false} role="link" size="lg" className="mt-10 h-12 gap-3 bg-white px-6 text-base text-black hover:bg-white/90 focus-visible:border-white focus-visible:ring-white/60 motion-reduce:transition-none">
          Către aplicație
          <ArrowRight aria-hidden="true" />
        </Button>
      </section>
      <footer className="relative z-10 pb-7 text-center text-xs leading-6 text-white/50 sm:text-sm">
        <p>Proiect realizat în cadrul lucrării de licență.</p>
        <p>Dezvoltat de RADU MATEI.</p>
      </footer>
    </main>
  )
}
