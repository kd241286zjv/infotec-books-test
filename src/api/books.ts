import { api, queryString } from './client'
import type { Book, BookFormInput, BookInput, Page } from './types'

export interface BooksQuery {
  page?: number
  perPage?: number
  authorId?: number
  year?: number
  search?: string
}

export function getBooks(query: BooksQuery = {}) {
  return api<Page<Book>>(
    `/books${queryString({ page: query.page, 'per-page': query.perPage, author_id: query.authorId, year: query.year, search: query.search })}`,
  )
}
export function getBook(id: number) {
  return api<Book>(`/books/${id}`)
}
function toFormData(input: BookFormInput) {
  const form = new FormData()
  form.set('title', input.title)
  form.set('year', String(input.year))
  form.set('description', input.description ?? '')
  form.set('isbn', input.isbn ?? '')
  input.author_ids.forEach((id) => form.append('author_ids', String(id)))
  form.set('cover', input.cover)
  return form
}
export function createBook(input: BookFormInput) {
  return api<Book>('/books', { method: 'POST', body: toFormData(input) })
}
export function updateBook(id: number, input: BookFormInput) {
  return api<Book>(`/books/${id}`, { method: 'PUT', body: toFormData(input) })
}
export function patchBook(id: number, input: Partial<BookInput>) {
  return api<Book>(`/books/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}
export function deleteBook(id: number) {
  return api<void>(`/books/${id}`, { method: 'DELETE' })
}
