<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../api/auth'
import { ApiError } from '../api/client'
import { auth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function submit() {
  error.value = ''
  const normalizedUsername = username.value.trim()
  if (!normalizedUsername || !password.value) {
    error.value = 'Введите логин и пароль.'
    return
  }

  submitting.value = true
  try {
    auth.save(await login(normalizedUsername, password.value))
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/books'
    await router.push(redirect)
  } catch (reason) {
    error.value =
      reason instanceof ApiError && reason.status === 401
        ? 'Неверный логин или пароль.'
        : 'Не удалось выполнить вход. Попробуйте ещё раз.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="auth-card">
    <p class="eyebrow">Личный кабинет</p>
    <h1>Вход</h1>
    <p class="muted">Авторизуйтесь, чтобы добавлять, редактировать и удалять книги и авторов.</p>
    <form class="auth-form" @submit.prevent="submit">
      <label>Логин<input v-model="username" required autocomplete="username" /></label>
      <label
        >Пароль<input v-model="password" required type="password" autocomplete="current-password"
      /></label>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button class="button" :disabled="submitting" :aria-busy="submitting">
        {{ submitting ? 'Входим…' : 'Войти' }}
      </button>
    </form>
  </section>
</template>
