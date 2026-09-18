import { computed, ref } from 'vue'
import type { LoginResponse, User } from '../api/types'

const storageKey = 'bookcase-session'
interface Session {
  token: string
  expiresAt: string
  user: User
}

function readSession(): Session | null {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey) ?? 'null') as Session | null
  } catch {
    return null
  }
}

const session = ref<Session | null>(readSession())

function save(response: LoginResponse) {
  session.value = {
    token: response.token,
    expiresAt: response.expires_at,
    user: response.user,
  }
  sessionStorage.setItem(storageKey, JSON.stringify(session.value))
}

function logout() {
  session.value = null
  sessionStorage.removeItem(storageKey)
}

export const auth = {
  token: computed(() => session.value?.token ?? null),
  user: computed(() => session.value?.user ?? null),
  isAuthenticated: computed(() => Boolean(session.value?.token)),
  save,
  logout,
}
