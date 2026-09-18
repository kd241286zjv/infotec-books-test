<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { auth } from './composables/useAuth'

const router = useRouter()
const isAuthenticated = computed(() => auth.isAuthenticated.value)

function logout() {
  auth.logout()
  void router.push({ name: 'books' })
}
</script>

<template>
  <header class="site-header">
    <RouterLink class="brand" :to="{ name: 'books' }">Bookcase</RouterLink>
    <nav aria-label="Основная навигация">
      <RouterLink :to="{ name: 'books' }">Книги</RouterLink>
      <RouterLink :to="{ name: 'authors' }">Авторы</RouterLink>
      <RouterLink :to="{ name: 'reports' }">Отчёты</RouterLink>
    </nav>
    <div class="header-actions">
      <RouterLink v-if="isAuthenticated" class="button" :to="{ name: 'book-create' }"
        >Добавить книгу</RouterLink
      >
      <button v-if="isAuthenticated" class="button button--quiet" type="button" @click="logout">
        Выйти
      </button>
      <RouterLink v-else class="button" :to="{ name: 'login' }">Войти</RouterLink>
    </div>
  </header>
  <main class="page-shell"><RouterView /></main>
</template>
