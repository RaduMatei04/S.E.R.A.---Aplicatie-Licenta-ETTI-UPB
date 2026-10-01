import { keycloak } from '@/auth/keycloak'

export const API_BASE_URL = import.meta.env.VITE_API_URL

/** Eroare de la API, cu statusul HTTP păstrat pentru decizii în UI. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Reîmprospătează token-ul dacă mai are sub 30 de secunde de valabilitate.
 *
 * Fără asta, o pagină lăsată deschisă peste durata token-ului începe brusc să
 * primească 401 pe fiecare cerere, deși utilizatorul este în continuare logat.
 */
async function authorizationHeader(): Promise<Record<string, string>> {
  try {
    await keycloak.updateToken(30)
  } catch {
    // Token-ul nu a putut fi reînnoit: cererea pleacă oricum și va primi 401,
    // iar stratul de autentificare decide dacă redirecționează spre login.
  }
  return keycloak.token ? { Authorization: `Bearer ${keycloak.token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(await authorizationHeader()),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

/** Backend-ul răspunde cu ProblemDetail (RFC 7807) la erorile de domeniu. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const problem = (await response.json()) as { detail?: string; title?: string }
    return problem.detail ?? problem.title ?? `Eroare ${response.status}`
  } catch {
    return `Eroare ${response.status}`
  }
}

function toQuery(params: Record<string, string | number | undefined | null>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  }
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | undefined | null>) =>
    request<T>(`${path}${params ? toQuery(params) : ''}`),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
}
