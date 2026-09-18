<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ApiError } from '../api/client'
import { deleteBook, getBook } from '../api/books'
import type { Book } from '../api/types'
import { auth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const book = ref<Book | null>(null)
const loading = ref(true)
const deleting = ref(false)
const notFound = ref(false)
const error = ref('')

function bookId() {
  const id = Number(route.params.id)
  return Number.isInteger(id) && id > 0 ? id : null
}

async function loadBook() {
  loading.value = true
  error.value = ''
  notFound.value = false

  const id = bookId()
  if (!id) {
    loading.value = false
    notFound.value = true
    return
  }

  try {
    book.value = await getBook(id)
  } catch (reason) {
    if (reason instanceof ApiError && reason.status === 404) notFound.value = true
    else error.value = reason instanceof Error ? reason.message : 'Не удалось загрузить книгу. Попробуйте ещё раз.'
  } finally {
    loading.value = false
  }
}

async function removeBook() {
  const id = bookId()
  if (!id || !book.value || !window.confirm(`Удалить «${book.value.title}»?`)) return

  deleting.value = true
  error.value = ''
  try {
    await deleteBook(id)
    await router.push({ name: 'books' })
  } catch (reason) {
    if (reason instanceof ApiError && reason.status === 404) notFound.value = true
    else error.value = reason instanceof Error ? reason.message : 'Не удалось удалить книгу. Попробуйте ещё раз.'
  } finally {
    deleting.value = false
  }
}

onMounted(() => { void loadBook() })
</script>

<template>
  <section class="book-detail">
    <RouterLink class="back-link" :to="{ name: 'books' }">← Все книги</RouterLink>

    <div v-if="loading" class="catalog-status" aria-live="polite">Загружаем книгу…</div>
    <div v-else-if="notFound" class="catalog-status catalog-status--error" role="alert">
      <p>Книга не найдена или больше не доступна.</p>
      <RouterLink class="button button--quiet" :to="{ name: 'books' }">Вернуться в каталог</RouterLink>
    </div>
    <div v-else-if="error" class="catalog-status catalog-status--error" role="alert">
      <p>{{ error }}</p>
      <button class="button button--quiet" type="button" @click="loadBook">Повторить</button>
    </div>
    <article v-else-if="book" class="book-detail__card">
      <div class="book-detail__cover">
        <img v-if="book.cover_url" :src="book.cover_url" :alt="`Обложка книги «${book.title}»`" />
        <span v-else aria-hidden="true">Нет обложки</span>
      </div>
      <div class="book-detail__content">
        <p class="eyebrow">{{ book.year }}</p>
        <h1>{{ book.title }}</h1>
        <p class="book-detail__authors">{{ book.authors.map((author) => author.full_name).join(', ') || 'Автор не указан' }}</p>
        <p v-if="book.isbn" class="book-isbn">ISBN {{ book.isbn }}</p>
        <p v-if="book.description" class="book-detail__description">{{ book.description }}</p>
        <p v-else class="muted">Описание отсутствует.</p>

        <div v-if="auth.isAuthenticated.value" class="book-detail__actions">
          <RouterLink class="button button--quiet" :to="{ name: 'book-edit', params: { id: book.id } }">Изменить</RouterLink>
          <button class="button button--danger" :disabled="deleting" @click="removeBook">{{ deleting ? 'Удаляем…' : 'Удалить' }}</button>
        </div>
      </div>
    </article>
  </section>
</template>
