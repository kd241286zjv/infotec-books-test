<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createAuthor, getAuthor, updateAuthor } from '../api/authors'
import { ApiError } from '../api/client'

const route = useRoute()
const router = useRouter()
const editing = computed(() => Boolean(route.params.id))
const fullName = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const loadError = ref('')

function authorId() {
  const id = Number(route.params.id)
  return Number.isInteger(id) && id > 0 ? id : null
}

async function loadAuthor() {
  loading.value = true
  loadError.value = ''
  try {
    if (editing.value) {
      const id = authorId()
      if (!id) throw new ApiError('Not found', 404)
      fullName.value = (await getAuthor(id)).full_name
    }
  } catch (reason) {
    loadError.value =
      reason instanceof ApiError && reason.status === 404
        ? 'Автор не найден.'
        : 'Не удалось загрузить форму. Попробуйте ещё раз.'
  } finally {
    loading.value = false
  }
}

async function submit() {
  const name = fullName.value.trim()
  if (!name) {
    error.value = 'Введите полное имя автора.'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    let savedAuthor
    if (editing.value) {
      const id = authorId()
      if (!id) throw new ApiError('Not found', 404)
      savedAuthor = await updateAuthor(id, name)
    } else {
      savedAuthor = await createAuthor(name)
    }
    await router.push({ name: 'author-detail', params: { id: savedAuthor.id } })
  } catch {
    error.value = 'Не удалось сохранить автора. Проверьте данные и повторите попытку.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadAuthor()
})
</script>

<template>
  <section class="form-page">
    <RouterLink class="back-link" :to="{ name: 'authors' }">← Все авторы</RouterLink>
    <p class="eyebrow">Каталог</p>
    <h1>{{ editing ? 'Изменить автора' : 'Новый автор' }}</h1>
    <p v-if="loading" class="catalog-status" aria-live="polite">Загружаем форму…</p>
    <div v-else-if="loadError" class="catalog-status catalog-status--error" role="alert">
      <p>{{ loadError }}</p>
      <button class="button button--quiet" type="button" @click="loadAuthor">Повторить</button>
    </div>
    <form v-else class="author-form" @submit.prevent="submit">
      <label><span>Полное имя</span><input v-model="fullName" required /></label>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="form-actions">
        <button class="button" :disabled="submitting" :aria-busy="submitting">
          {{ submitting ? 'Сохраняем…' : 'Сохранить' }}</button
        ><RouterLink class="button button--quiet" :to="{ name: 'authors' }">Отмена</RouterLink>
      </div>
    </form>
  </section>
</template>
