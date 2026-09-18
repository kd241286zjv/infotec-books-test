import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../composables/useAuth'
import AuthorDetailView from '../views/AuthorDetailView.vue'
import AuthorFormView from '../views/AuthorFormView.vue'
import AuthorsView from '../views/AuthorsView.vue'
import BookDetailView from '../views/BookDetailView.vue'
import BookFormView from '../views/BookFormView.vue'
import BooksView from '../views/BooksView.vue'
import LoginView from '../views/LoginView.vue'
import ReportsView from '../views/ReportsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: { name: 'books' } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/books', name: 'books', component: BooksView },
    { path: '/books/new', name: 'book-create', component: BookFormView, meta: { requiresAuth: true } },
    { path: '/books/:id/edit', name: 'book-edit', component: BookFormView, meta: { requiresAuth: true } },
    { path: '/books/:id', name: 'book-detail', component: BookDetailView },
    { path: '/authors', name: 'authors', component: AuthorsView },
    { path: '/authors/new', name: 'author-create', component: AuthorFormView, meta: { requiresAuth: true } },
    { path: '/authors/:id/edit', name: 'author-edit', component: AuthorFormView, meta: { requiresAuth: true } },
    { path: '/authors/:id', name: 'author-detail', component: AuthorDetailView },
    { path: '/reports', name: 'reports', component: ReportsView },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isAuthenticated.value) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && auth.isAuthenticated.value) return { name: 'books' }
  return true
})

export default router
