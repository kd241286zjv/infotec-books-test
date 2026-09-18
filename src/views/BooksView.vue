<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getAuthors } from '../api/authors'
import { getBooks } from '../api/books'
import type { AuthorShort, Book, Pagination } from '../api/types'
import { auth } from '../composables/useAuth'

const books = ref<Book[]>([])
const authors = ref<AuthorShort[]>([])
const pagination = ref<Pagination | null>(null)
const search = ref('')
const year = ref('')
const authorId = ref('')
const loading = ref(true)
const error = ref('')
const authorsError = ref('')

function asNumber(value: string) {
  const number = Number(value)
  return value && Number.isInteger(number) ? number : undefined
}

function shortDescription(description: string) {
  return description.length > 180 ? `${description.slice(0, 177)}…` : description
}

async function loadBooks(page = 1) {
  loading.value = true
  error.value = ''

  try {
    const result = await getBooks({
      page,
      perPage: 12,
      search: search.value,
      year: asNumber(year.value),
      authorId: asNumber(authorId.value),
    })
    books.value = result.items
    pagination.value = result.pagination
  } catch {
    error.value = 'Не удалось загрузить каталог. Попробуйте ещё раз.'
  } finally {
    loading.value = false
  }
}

async function loadAuthors() {
  try {
    authors.value = (await getAuthors()).items
  } catch {
    authorsError.value = 'Не удалось загрузить фильтр авторов.'
  }
}

function applyFilters() {
  void loadBooks()
}

onMounted(() => {
  void loadAuthors()
  void loadBooks()
})
</script>

<template>
  <section class="catalog-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">Каталог</p>
        <h1>Книги</h1>
        <p class="muted">Откройте для себя книги и их авторов.</p>
      </div>
      <RouterLink v-if="auth.isAuthenticated.value" class="button" :to="{ name: 'book-create' }">
        Добавить книгу
      </RouterLink>
    </header>

    <form class="catalog-filters" @submit.prevent="applyFilters">
      <label>
        <span>Поиск</span>
        <input v-model.trim="search" type="search" placeholder="Название или ISBN" />
      </label>
      <label>
        <span>Год издания</span>
        <input
          v-model="year"
          type="number"
          min="0"
          inputmode="numeric"
          placeholder="Например, 2024"
        />
      </label>
      <label>
        <span>Автор</span>
        <select v-model="authorId">
          <option value="">Все авторы</option>
          <option v-for="author in authors" :key="author.id" :value="String(author.id)">
            {{ author.full_name }}
          </option>
        </select>
        <small v-if="authorsError" class="filter-error">{{ authorsError }}</small>
      </label>
      <button class="button" :disabled="loading">Применить</button>
    </form>

    <div v-if="loading" class="catalog-status" aria-live="polite">Загружаем книги…</div>
    <div v-else-if="error" class="catalog-status catalog-status--error" role="alert">
      <p>{{ error }}</p>
      <button class="button button--quiet" type="button" @click="loadBooks(pagination?.page)">
        Повторить
      </button>
    </div>
    <template v-else>
      <div v-if="books.length" class="book-grid">
        <RouterLink
          v-for="book in books"
          :key="book.id"
          class="book-card"
          :to="{ name: 'book-detail', params: { id: book.id } }"
        >
          <div class="book-cover">
            <img
              v-if="book.cover_url"
              :src="book.cover_url"
              :alt="`Обложка книги «${book.title}»`"
            />
            <span v-else aria-hidden="true">Нет обложки</span>
          </div>
          <div class="book-card__body">
            <p class="book-year">{{ book.year }}</p>
            <h2>{{ book.title }}</h2>
            <p class="book-authors">
              {{ book.authors.map((author) => author.full_name).join(', ') || 'Автор не указан' }}
            </p>
            <p v-if="book.isbn" class="book-isbn">ISBN {{ book.isbn }}</p>
            <p v-if="book.description" class="book-description">
              {{ shortDescription(book.description) }}
            </p>
          </div>
        </RouterLink>
      </div>
      <p v-else class="catalog-status">По заданным фильтрам ничего не найдено.</p>

      <nav
        v-if="pagination && pagination.total_pages > 1"
        class="pagination"
        aria-label="Страницы каталога"
      >
        <button
          class="button button--quiet"
          :disabled="pagination.page <= 1"
          @click="loadBooks(pagination.page - 1)"
        >
          Назад
        </button>
        <span>Страница {{ pagination.page }} из {{ pagination.total_pages }}</span>
        <button
          class="button button--quiet"
          :disabled="pagination.page >= pagination.total_pages"
          @click="loadBooks(pagination.page + 1)"
        >
          Далее
        </button>
      </nav>
    </template>
  </section>
</template>
