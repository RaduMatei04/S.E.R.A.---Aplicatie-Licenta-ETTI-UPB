import { z } from 'zod'

export const accents = {
  brad: { label: 'Brad', color: '#139438', logo: '/logo_dashboard_brad.png' },
  iris: { label: 'Iris', color: '#4948E8', logo: '/logo_dashboard_iris.png' },
  trandafir: { label: 'Trandafir', color: '#D62957', logo: '/logo_dashboard_trandafir.png' },
  lavanda: { label: 'Lavand\u0103', color: '#9673E7', logo: '/logo_dashboard_lavanda.png' },
} as const

export type Accent = keyof typeof accents
export const accentSchema = z.enum(Object.keys(accents) as [Accent, ...Accent[]])
export const colorModeSchema = z.enum(['light', 'dark'])
export type ColorMode = z.infer<typeof colorModeSchema>
