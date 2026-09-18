<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuthors } from '../api/authors'
import { createBook, getBook, updateBook } from '../api/books'
import type { AuthorShort } from '../api/types'

const route = useRoute(); const router = useRouter()
const id = computed(() => Number(route.params.id))
const editing = computed(() => Boolean(route.params.id))
const authors = ref<AuthorShort[]>([]); const selectedAuthors = ref<number[]>([])
const title = ref(''); const year = ref<number | undefined>(); const description = ref(''); const isbn = ref(''); const cover = ref<File | null>(null)
const loading = ref(true); const submitting = ref(false); const error = ref('')

async function load() {
  loading.value = true; error.value = ''
  try {
    const authorsResult = await getAuthors()
    authors.value = authorsResult.items
    if (editing.value) {
      const book = await getBook(id.value)
      title.value = book.title; year.value = book.year; description.value = book.description ?? ''; isbn.value = book.isbn ?? ''; selectedAuthors.value = book.authors.map((author) => author.id)
    }
  } catch (reason) { error.value = reason instanceof Error ? reason.message : 'Не удалось загрузить форму.' } finally { loading.value = false }
}
function selectCover(event: Event) { cover.value = (event.target as HTMLInputElement).files?.[0] ?? null }
async function submit() {
  if (!year.value || !cover.value || selectedAuthors.value.length === 0) { error.value = 'Заполните название, год, авторов и выберите обложку.'; return }
  submitting.value = true; error.value = ''
  try {
    const input = { title: title.value, year: year.value, description: description.value || undefined, isbn: isbn.value || undefined, author_ids: selectedAuthors.value, cover: cover.value }
    if (editing.value) await updateBook(id.value, input); else await createBook(input)
    await router.push({ name: 'books' })
  } catch (reason) { error.value = reason instanceof Error ? reason.message : 'Не удалось сохранить книгу.' } finally { submitting.value = false }
}
onMounted(() => { void load() })
</script>

<template>
  <section class="form-page"><p class="eyebrow">Каталог</p><h1>{{ editing ? 'Изменить книгу' : 'Новая книга' }}</h1>
    <p v-if="loading" class="muted">Загружаем форму…</p>
    <form v-else class="form-card stack" @submit.prevent="submit">
      <label>Название<input v-model.trim="title" required /></label>
      <label>Год издания<input v-model.number="year" type="number" min="0" required /></label>
      <label>Описание<textarea v-model.trim="description" rows="5" /></label>
      <label>ISBN<input v-model.trim="isbn" /></label>
      <fieldset><legend>Авторы</legend><label v-for="author in authors" :key="author.id" class="checkbox"><input v-model="selectedAuthors" type="checkbox" :value="author.id" />{{ author.full_name }}</label></fieldset>
      <label>Обложка<input type="file" accept="image/*" :required="!editing" @change="selectCover" /><small v-if="editing">API требует файл при полном обновлении: выберите новую обложку.</small></label>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="form-actions"><button class="button" :disabled="submitting">{{ submitting ? 'Сохраняем…' : 'Сохранить' }}</button><RouterLink class="button button--quiet" :to="{ name: 'books' }">Отмена</RouterLink></div>
    </form>
  </section>
</template>
