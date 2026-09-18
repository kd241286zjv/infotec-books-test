export interface User { id: number; username: string; role: string }
export interface LoginResponse { token: string; expires_at: string; user: User }
export interface AuthorShort { id: number; full_name: string }
export interface BookShort { id: number; title: string; year: number }
export interface Book { id: number; title: string; year: number; description?: string; isbn?: string; cover_url?: string; authors: AuthorShort[] }
export interface Author { id: number; full_name: string; books?: BookShort[] }
export interface Pagination { total: number; page: number; per_page: number; total_pages: number }
export interface Page<T> { items: T[]; pagination: Pagination }
export interface TopAuthor { rank: number; author_id: number; full_name: string; books_count: number }
export interface TopAuthorsReport { year: number; items: TopAuthor[] }
export interface BookInput { title: string; year: number; description?: string; isbn?: string; author_ids: number[] }
export interface BookFormInput extends BookInput { cover: File }
