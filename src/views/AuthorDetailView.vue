<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { deleteAuthor, getAuthor } from '../api/authors'
import { ApiError } from '../api/client'
import type { Author } from '../api/types'
import { auth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const author = ref<Author | null>(null)
const loading = ref(true)
const deleting = ref(false)
const notFound = ref(false)
const error = ref('')

function authorId() {
  const id = Number(route.params.id)
  return Number.isInteger(id) && id > 0 ? id : null
}

async function loadAuthor() {
  loading.value = true
  error.value = ''
  notFound.value = false
  const id = authorId()
  if (!id) {
    loading.value = false
    notFound.value = true
    return
  }
  try {
    author.value = await getAuthor(id)
  } catch (reason) {
    if (reason instanceof ApiError && reason.status === 404) notFound.value = true
    else error.value = 'Не удалось загрузить автора. Попробуйте ещё раз.'
  } finally {
    loading.value = false
  }
}

async function removeAuthor() {
  const id = authorId()
  if (!id || !author.value || !window.confirm(`Удалить автора «${author.value.full_name}»?`)) return
  deleting.value = true
  error.value = ''
  try {
    await deleteAuthor(id)
    await router.push({ name: 'authors' })
  } catch (reason) {
    if (reason instanceof ApiError && reason.status === 404) notFound.value = true
    else error.value = 'Не удалось удалить автора. Попробуйте ещё раз.'
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  void loadAuthor()
})
watch(
  () => route.params.id,
  () => {
    void loadAuthor()
  },
)
</script>

<template>
  <section class="author-detail">
    <RouterLink class="back-link" :to="{ name: 'authors' }">← Все авторы</RouterLink>
    <p v-if="loading" class="catalog-status" aria-live="polite">Загружаем автора…</p>
    <div v-else-if="notFound" class="catalog-status catalog-status--error" role="alert">
      <p>Автор не найден или больше не доступен.</p>
      <RouterLink class="button button--quiet" :to="{ name: 'authors' }"
        >Вернуться к авторам</RouterLink
      >
    </div>
    <div v-else-if="error" class="catalog-status catalog-status--error" role="alert">
      <p>{{ error }}</p>
      <button class="button button--quiet" type="button" @click="loadAuthor">Повторить</button>
    </div>
    <article v-else-if="author" class="author-detail__card">
      <p class="eyebrow">Автор</p>
      <h1>{{ author.full_name }}</h1>
      <h2>Книги</h2>
      <ul v-if="author.books?.length" class="author-books">
        <li v-for="book in author.books" :key="book.id">
          <RouterLink :to="{ name: 'book-detail', params: { id: book.id } }"
            >{{ book.title }} <span>({{ book.year }})</span></RouterLink
          >
        </li>
      </ul>
      <p v-else class="muted">Книг пока нет.</p>
      <div v-if="auth.isAuthenticated.value" class="book-detail__actions">
        <RouterLink
          class="button button--quiet"
          :to="{ name: 'author-edit', params: { id: author.id } }"
          >Изменить</RouterLink
        >
        <button class="button button--danger" :disabled="deleting" @click="removeAuthor">
          {{ deleting ? 'Удаляем…' : 'Удалить' }}
        </button>
      </div>
    </article>
  </section>
</template>
