import { useEffect, useRef } from 'react'
import { initParticles } from '../lib/initParticles'

export function ParticleBackground({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controllerRef = useRef<ReturnType<typeof initParticles>>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const controller = initParticles(canvas)
    controllerRef.current = controller
    return () => {
      controller?.destroy()
      controllerRef.current = undefined
    }
  }, [])

  useEffect(() => {
    controllerRef.current?.setColor(color)
  }, [color])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}
