import { accents } from '@/features/theme/theme.config'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

type ParticleOptions = {
  maxParticles: number
  connectionDistance: number
  particleColor: string
  lineColor: string
  speed: number
  mouseForce: number
}

type ParticleController = {
  setColor: (color: string) => void
  destroy: () => void
}

const PARTICLE_COLOR = accents.brad.color
const DEFAULT_OPTIONS: ParticleOptions = {
  maxParticles: 130,
  connectionDistance: 172,
  particleColor: PARTICLE_COLOR,
  lineColor: PARTICLE_COLOR,
  speed: 20,
  mouseForce: 330,
}
const MOBILE_WIDTH = 768
const MOBILE_PARTICLES = 32
const MAX_DPR = 2
const MAX_DELTA_SECONDS = 0.05
const POINTER_RADIUS = 180
const LINE_OPACITY = 0.9
const PARTICLE_OPACITY = 0.9
const MIN_RADIUS = 3
const RADIUS_RANGE = 1
const FULL_CIRCLE = Math.PI * 2

export function initParticles(canvas: HTMLCanvasElement, options: Partial<ParticleOptions> = {}): ParticleController | undefined {
  const context = canvas.getContext('2d')
  if (!context) return

  const settings = { ...DEFAULT_OPTIONS, ...options }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let width = 0
  let height = 0
  let particles: Particle[] = []
  let frameId: number | undefined
  let previousTime: number | undefined
  let pointer: { x: number; y: number } | undefined

  function draw() {
    if (!context) return
    context.clearRect(0, 0, width, height)
    context.strokeStyle = settings.lineColor
    context.lineWidth = 1.2
    for (const [index, particle] of particles.entries()) {
      for (const other of particles.slice(index + 1)) {
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y)
        if (distance >= settings.connectionDistance) continue
        context.globalAlpha = LINE_OPACITY * (1 - distance / settings.connectionDistance)
        context.beginPath()
        context.moveTo(particle.x, particle.y)
        context.lineTo(other.x, other.y)
        context.stroke()
      }
      context.globalAlpha = PARTICLE_OPACITY
      context.fillStyle = settings.particleColor
      context.beginPath()
      context.arc(particle.x, particle.y, particle.radius, 0, FULL_CIRCLE)
      context.fill()
    }
    context.globalAlpha = 1
  }

  function move(particle: Particle, delta: number) {
    particle.x += particle.vx * delta
    particle.y += particle.vy * delta
    if (pointer) {
      const dx = particle.x - pointer.x
      const dy = particle.y - pointer.y
      const distance = Math.hypot(dx, dy)
      if (distance > 0 && distance < POINTER_RADIUS) {
        const force = settings.mouseForce * (1 - distance / POINTER_RADIUS) * delta
        particle.x += dx / distance * force
        particle.y += dy / distance * force
      }
    }
    particle.x = (particle.x + width) % width
    particle.y = (particle.y + height) % height
  }

  function animate(time: number) {
    frameId = undefined
    const delta = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, MAX_DELTA_SECONDS)
    previousTime = time
    for (const particle of particles) move(particle, delta)
    draw()
    frameId = window.requestAnimationFrame(animate)
  }

  function syncMotion() {
    if (frameId !== undefined) window.cancelAnimationFrame(frameId)
    frameId = undefined
    previousTime = undefined
    pointer = undefined
    draw()
    if (!reducedMotion.matches) frameId = window.requestAnimationFrame(animate)
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect()
    width = Math.max(1, bounds.width)
    height = Math.max(1, bounds.height)
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    context?.setTransform(dpr, 0, 0, dpr, 0, 0)
    const count = width < MOBILE_WIDTH ? Math.min(settings.maxParticles, MOBILE_PARTICLES) : settings.maxParticles
    particles = Array.from({ length: count }, () => {
      const angle = Math.random() * FULL_CIRCLE
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * settings.speed,
        vy: Math.sin(angle) * settings.speed,
        radius: MIN_RADIUS + Math.random() * RADIUS_RANGE,
      }
    })
    syncMotion()
  }

  function handlePointer(event: PointerEvent) {
    if (reducedMotion.matches || event.pointerType === 'touch') return
    const bounds = canvas.getBoundingClientRect()
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
  }

  function clearPointer() {
    pointer = undefined
  }

  window.addEventListener('pointermove', handlePointer, { passive: true })
  window.addEventListener('pointerout', clearPointer)
  window.addEventListener('pointercancel', clearPointer)
  window.addEventListener('blur', clearPointer)
  window.addEventListener('resize', resize)
  reducedMotion.addEventListener('change', syncMotion)
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  return {
    setColor(color) {
      settings.particleColor = color
      settings.lineColor = color
      draw()
    },
    destroy() {
      if (frameId !== undefined) window.cancelAnimationFrame(frameId)
      observer.disconnect()
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('pointerout', clearPointer)
      window.removeEventListener('pointercancel', clearPointer)
      window.removeEventListener('blur', clearPointer)
      window.removeEventListener('resize', resize)
      reducedMotion.removeEventListener('change', syncMotion)
    },
  }
}
