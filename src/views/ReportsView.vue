<script setup lang="ts">
import { ref } from 'vue'
import { ApiError } from '../api/client'
import { getTopAuthors } from '../api/reports'
import type { TopAuthorsReport } from '../api/types'

const year = ref(String(new Date().getFullYear()))
const report = ref<TopAuthorsReport | null>(null)
const loading = ref(false)
const error = ref('')

function validYear() {
  const value = Number(year.value)
  return year.value && Number.isInteger(value) && value >= 0 ? value : null
}

async function submit() {
  const selectedYear = validYear()
  if (selectedYear === null) {
    error.value = 'Введите корректный год.'
    return
  }

  loading.value = true
  error.value = ''
  report.value = null
  try {
    report.value = await getTopAuthors(selectedYear)
  } catch (reason) {
    error.value = reason instanceof ApiError && reason.status === 400
      ? 'Для этого отчёта требуется корректный год.'
      : 'Не удалось загрузить отчёт. Попробуйте ещё раз.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="reports-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">Отчёты</p>
        <h1>Топ-10 авторов</h1>
        <p class="muted">Авторы с наибольшим количеством книг за выбранный год.</p>
      </div>
    </header>

    <form class="report-form" @submit.prevent="submit">
      <label>
        <span>Год</span>
        <input v-model="year" required type="number" min="0" step="1" inputmode="numeric" />
      </label>
      <button class="button" :disabled="loading" :aria-busy="loading">{{ loading ? 'Загружаем…' : 'Показать отчёт' }}</button>
    </form>

    <p v-if="loading" class="catalog-status" aria-live="polite">Строим отчёт…</p>
    <div v-else-if="error" class="catalog-status catalog-status--error" role="alert">
      <p>{{ error }}</p>
    </div>
    <section v-else-if="report" class="report-card">
      <h2>Рейтинг за {{ report.year }} год</h2>
      <p v-if="!report.items.length" class="catalog-status">За этот год данных нет.</p>
      <div v-else class="report-table-wrap">
        <table>
          <thead><tr><th scope="col">Место</th><th scope="col">Автор</th><th scope="col">Книг</th></tr></thead>
          <tbody><tr v-for="author in report.items" :key="author.author_id"><td>{{ author.rank }}</td><td>{{ author.full_name }}</td><td>{{ author.books_count }}</td></tr></tbody>
        </table>
      </div>
    </section>
  </section>
</template>
