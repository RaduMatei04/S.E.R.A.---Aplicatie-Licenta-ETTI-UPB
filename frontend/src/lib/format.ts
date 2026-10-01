const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('ro', { numeric: 'auto' })
const TIME_FORMATTER = new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit' })
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

/** „acum 3 secunde”, „acum 5 minute” — pentru momentul ultimei citiri. */
export function formatRelative(iso: string | null | undefined): string | null {
  if (!iso) return null

  const seconds = Math.round((Date.parse(iso) - Date.now()) / 1000)
  const absolute = Math.abs(seconds)

  if (absolute < 60) return RELATIVE_FORMATTER.format(Math.min(seconds, -1), 'second')
  if (absolute < 3600) return RELATIVE_FORMATTER.format(Math.round(seconds / 60), 'minute')
  if (absolute < 86_400) return RELATIVE_FORMATTER.format(Math.round(seconds / 3600), 'hour')
  return RELATIVE_FORMATTER.format(Math.round(seconds / 86_400), 'day')
}

export function formatTime(iso: string): string {
  return TIME_FORMATTER.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return DATE_TIME_FORMATTER.format(new Date(iso))
}

/** Secunde în „2 min 15 s”, pentru vechimea ultimei recepții. */
export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds === null || seconds === undefined) return null
  if (seconds < 60) return `${Math.round(seconds)} s`

  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  if (minutes < 60) return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`

  const hours = Math.floor(minutes / 60)
  return `${hours} h ${minutes % 60} min`
}
