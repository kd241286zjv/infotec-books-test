<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { deleteAuthor, getAuthors } from '../api/authors'
import { ApiError } from '../api/client'
import type { AuthorShort } from '../api/types'
import { auth } from '../composables/useAuth'

const authors = ref<AuthorShort[]>([])
const search = ref('')
const loading = ref(true)
const deletingId = ref<number | null>(null)
const error = ref('')

async function loadAuthors() {
  loading.value = true
  error.value = ''
  try {
    authors.value = (await getAuthors(1, search.value.trim())).items
  } catch {
    error.value = 'Не удалось загрузить авторов. Попробуйте ещё раз.'
  } finally {
    loading.value = false
  }
}

async function removeAuthor(author: AuthorShort) {
  if (!window.confirm(`Удалить автора «${author.full_name}»?`)) return
  deletingId.value = author.id
  error.value = ''
  try {
    await deleteAuthor(author.id)
    await loadAuthors()
  } catch (reason) {
    error.value = reason instanceof ApiError && reason.status === 404
      ? 'Этот автор уже удалён.'
      : 'Не удалось удалить автора. Попробуйте ещё раз.'
  } finally {
    deletingId.value = null
  }
}

onMounted(() => { void loadAuthors() })
</script>

<template>
  <section class="authors-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">Каталог</p>
        <h1>Авторы</h1>
        <p class="muted">Находите авторов и книги из их библиографии.</p>
      </div>
      <RouterLink v-if="auth.isAuthenticated.value" class="button" :to="{ name: 'author-create' }">Добавить автора</RouterLink>
    </header>

    <form class="authors-search" @submit.prevent="loadAuthors">
      <label>
        <span>Поиск автора</span>
        <input v-model="search" type="search" placeholder="Введите имя автора" />
      </label>
      <button class="button" :disabled="loading">Найти</button>
    </form>

    <p v-if="loading" class="catalog-status" aria-live="polite">Загружаем авторов…</p>
    <div v-else-if="error" class="catalog-status catalog-status--error" role="alert">
      <p>{{ error }}</p>
      <button class="button button--quiet" type="button" @click="loadAuthors">Повторить</button>
    </div>
    <div v-else-if="authors.length" class="authors-list">
      <article v-for="author in authors" :key="author.id" class="author-card">
        <RouterLink class="author-card__link" :to="{ name: 'author-detail', params: { id: author.id } }">{{ author.full_name }}</RouterLink>
        <div v-if="auth.isAuthenticated.value" class="author-card__actions">
          <RouterLink :to="{ name: 'author-edit', params: { id: author.id } }">Изменить</RouterLink>
          <button class="link-danger" :disabled="deletingId === author.id" @click="removeAuthor(author)">{{ deletingId === author.id ? 'Удаляем…' : 'Удалить' }}</button>
        </div>
      </article>
    </div>
    <p v-else class="catalog-status">Авторы не найдены.</p>
  </section>
</template>
