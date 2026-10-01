import { z } from 'zod'

/**
 * Validarea formularului de setări, înainte ca datele să plece spre backend.
 *
 * Backend-ul validează din nou aceleași reguli — el este autoritatea — dar verificarea
 * aici dă erori imediate, în română, lângă câmpul greșit.
 */

/** Câmp numeric opțional: gol înseamnă „fără limită”, nu zero. */
const optionalNumber = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : Number(value.replace(',', '.'))))
  .refine((value) => value === null || Number.isFinite(value), {
    message: 'Introdu un număr valid',
  })

export const thresholdSchema = z
  .object({
    id: z.number(),
    minValue: optionalNumber,
    maxValue: optionalNumber,
    enabled: z.boolean(),
  })
  .refine((threshold) => !threshold.enabled || threshold.minValue !== null || threshold.maxValue !== null, {
    message: 'Un prag activ are nevoie de cel puțin o limită',
  })
  .refine(
    (threshold) =>
      threshold.minValue === null ||
      threshold.maxValue === null ||
      threshold.minValue < threshold.maxValue,
    { message: 'Minimul trebuie să fie mai mic decât maximul' },
  )

export const settingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Numele serei este obligatoriu')
    .max(120, 'Numele serei poate avea cel mult 120 de caractere'),
  description: z
    .string()
    .trim()
    .max(500, 'Descrierea poate avea cel mult 500 de caractere'),
  thresholds: z.array(thresholdSchema),
})

export type SettingsFormValues = z.input<typeof settingsSchema>

/** Mapează erorile Zod pe câmpul care le-a produs, ca să apară lângă input. */
export function collectErrors(
  error: { issues: Array<{ path: PropertyKey[]; message: string }> },
  thresholdIds: number[],
): Record<string, string> {
  const collected: Record<string, string> = {}

  for (const issue of error.issues) {
    const [first, second] = issue.path
    if (first === 'thresholds' && typeof second === 'number') {
      collected[`threshold-${thresholdIds[second]}`] = issue.message
    } else if (typeof first === 'string') {
      collected[first] = issue.message
    }
  }
  return collected
}
