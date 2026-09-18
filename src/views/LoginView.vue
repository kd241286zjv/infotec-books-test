<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../api/auth'
import { auth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    auth.save(await login(username.value, password.value))
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/books'
    await router.push(redirect)
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Не удалось войти.'
  } finally { submitting.value = false }
}
</script>

<template>
  <section class="auth-card">
    <p class="eyebrow">Личный кабинет</p>
    <h1>Вход</h1>
    <p class="muted">Авторизуйтесь, чтобы добавлять, редактировать и удалять книги и авторов.</p>
    <form class="stack" @submit.prevent="submit">
      <label>Логин<input v-model.trim="username" required autocomplete="username" /></label>
      <label>Пароль<input v-model="password" required type="password" autocomplete="current-password" /></label>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button class="button" :disabled="submitting">{{ submitting ? 'Входим…' : 'Войти' }}</button>
    </form>
  </section>
</template>
