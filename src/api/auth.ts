import { api } from './client'
import type { LoginResponse } from './types'

export function login(username: string, password: string) {
  return api<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}
