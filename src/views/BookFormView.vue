<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuthors } from '../api/authors'
import { ApiError } from '../api/client'
import { createBook, getBook, patchBook, updateBook } from '../api/books'
import type { AuthorShort, Book } from '../api/types'

const route = useRoute()
const router = useRouter()
const editing = computed(() => Boolean(route.params.id))
const authors = ref<AuthorShort[]>([])
const selectedAuthors = ref<number[]>([])
const title = ref('')
const year = ref('')
const description = ref('')
const isbn = ref('')
const cover = ref<File | null>(null)
const currentCoverUrl = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')

function routeBookId() {
  const id = Number(route.params.id)
  return Number.isInteger(id) && id > 0 ? id : null
}

function apiMessage(reason: unknown, action: 'load' | 'save') {
  if (reason instanceof ApiError && reason.status === 404) return 'Книга не найдена.'
  return action === 'load'
    ? 'Не удалось загрузить данные формы. Попробуйте ещё раз.'
    : 'Не удалось сохранить книгу. Проверьте данные и повторите попытку.'
}

function fillForm(book: Book) {
  title.value = book.title
  year.value = String(book.year)
  description.value = book.description ?? ''
  isbn.value = book.isbn ?? ''
  selectedAuthors.value = book.authors.map((author) => author.id)
  currentCoverUrl.value = book.cover_url ?? ''
}

async function loadForm() {
  loading.value = true
  error.value = ''
  try {
    const authorRequest = getAuthors()
    if (editing.value) {
      const id = routeBookId()
      if (!id) throw new ApiError('Not found', 404)
      const [authorsResult, book] = await Promise.all([authorRequest, getBook(id)])
      authors.value = authorsResult.items
      fillForm(book)
    } else {
      authors.value = (await authorRequest).items
    }
  } catch (reason) {
    error.value = apiMessage(reason, 'load')
  } finally {
    loading.value = false
  }
}

function selectCover(event: Event) {
  cover.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

function validate() {
  if (!title.value.trim()) return 'Введите название книги.'
  const numericYear = Number(year.value)
  if (!year.value || !Number.isInteger(numericYear) || numericYear < 0)
    return 'Введите корректный год издания.'
  if (selectedAuthors.value.length === 0) return 'Выберите хотя бы одного автора.'
  if (!editing.value && !cover.value) return 'Выберите файл обложки.'
  return null
}

async function submit() {
  const validationError = validate()
  if (validationError) {
    error.value = validationError
    return
  }

  const numericYear = Number(year.value)
  submitting.value = true
  error.value = ''
  try {
    let savedBook: Book
    if (editing.value) {
      const id = routeBookId()
      if (!id) throw new ApiError('Not found', 404)
      savedBook = cover.value
        ? await updateBook(id, {
            title: title.value.trim(),
            year: numericYear,
            description: description.value,
            isbn: isbn.value,
            author_ids: selectedAuthors.value,
            cover: cover.value,
          })
        : await patchBook(id, {
            title: title.value.trim(),
            year: numericYear,
            description: description.value,
            isbn: isbn.value,
            author_ids: selectedAuthors.value,
          })
    } else {
      savedBook = await createBook({
        title: title.value.trim(),
        year: numericYear,
        description: description.value,
        isbn: isbn.value,
        author_ids: selectedAuthors.value,
        cover: cover.value as File,
      })
    }
    await router.push({ name: 'book-detail', params: { id: savedBook.id } })
  } catch (reason) {
    error.value = apiMessage(reason, 'save')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadForm()
})
</script>

<template>
  <section class="form-page">
    <RouterLink class="back-link" :to="{ name: 'books' }">← Все книги</RouterLink>
    <p class="eyebrow">Каталог</p>
    <h1>{{ editing ? 'Изменить книгу' : 'Новая книга' }}</h1>

    <p v-if="loading" class="catalog-status" aria-live="polite">Загружаем форму…</p>
    <div
      v-else-if="error && !authors.length"
      class="catalog-status catalog-status--error"
      role="alert"
    >
      <p>{{ error }}</p>
      <button class="button button--quiet" type="button" @click="loadForm">Повторить</button>
    </div>
    <form v-else class="book-form" @submit.prevent="submit">
      <label>
        <span>Название</span>
        <input v-model="title" required />
      </label>
      <label>
        <span>Год издания</span>
        <input v-model="year" required type="number" min="0" step="1" inputmode="numeric" />
      </label>
      <label>
        <span>Описание <small>Необязательно</small></span>
        <textarea v-model="description" rows="5" />
      </label>
      <label>
        <span>ISBN <small>Необязательно</small></span>
        <input v-model="isbn" />
      </label>

      <fieldset class="author-selector">
        <legend>Авторы</legend>
        <label v-for="author in authors" :key="author.id" class="checkbox">
          <input v-model="selectedAuthors" type="checkbox" :value="author.id" />
          {{ author.full_name }}
        </label>
        <p v-if="!authors.length" class="form-hint">
          Нет доступных авторов. Сначала добавьте автора в каталоге авторов.
        </p>
      </fieldset>

      <div v-if="editing && currentCoverUrl" class="current-cover">
        <p>Текущая обложка</p>
        <img :src="currentCoverUrl" alt="Текущая обложка книги" />
      </div>
      <label>
        <span
          >{{ editing ? 'Новая обложка' : 'Обложка' }}
          <small v-if="editing">Необязательно</small></span
        >
        <input type="file" accept="image/*" :required="!editing" @change="selectCover" />
        <small v-if="cover">Выбран файл: {{ cover.name }}</small>
        <small v-else-if="editing">Без нового файла будут обновлены только текстовые поля.</small>
      </label>

      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="form-actions">
        <button class="button" :disabled="submitting" :aria-busy="submitting">
          {{ submitting ? 'Сохраняем…' : 'Сохранить' }}
        </button>
        <RouterLink class="button button--quiet" :to="{ name: 'books' }">Отмена</RouterLink>
      </div>
    </form>
  </section>
</template>
