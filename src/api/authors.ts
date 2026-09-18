import { api, queryString } from './client'
import type { Author, AuthorShort, Page } from './types'

export function getAuthors(page = 1, search = '') {
  return api<Page<AuthorShort>>(`/authors${queryString({ page, 'per-page': 50, search })}`)
}
export function getAuthor(id: number) {
  return api<Author>(`/authors/${id}`)
}
export function createAuthor(full_name: string) {
  return api<Author>('/authors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name }),
  })
}
export function updateAuthor(id: number, full_name: string) {
  return api<Author>(`/authors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name }),
  })
}
export function deleteAuthor(id: number) {
  return api<void>(`/authors/${id}`, { method: 'DELETE' })
}
