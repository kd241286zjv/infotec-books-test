import { auth } from '../composables/useAuth'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
interface ApiEnvelope<T> { success: boolean; data: T }
interface ErrorItem { field?: string; message: string }
interface ErrorEnvelope { errors?: ErrorItem[] }

export class ApiError extends Error {
  readonly status: number
  readonly errors: ErrorItem[]

  constructor(message: string, status: number, errors: ErrorItem[] = []) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = auth.token.value
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers })
  if (response.status === 204) return undefined as T
  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & ErrorEnvelope
  if (!response.ok || !payload.success) {
    if (response.status === 401) auth.logout()
    const errors = payload.errors ?? []
    throw new ApiError(errors.map((error) => error.message).join('. ') || 'Не удалось выполнить запрос.', response.status, errors)
  }
  return payload.data
}

export function queryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') search.set(key, String(value))
  return search.size ? `?${search.toString()}` : ''
}
