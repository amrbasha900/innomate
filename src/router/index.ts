// src/router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('../views/DocumentsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/modules/:module',
    name: 'Module',
    component: () => import('../views/ModulePage.vue'),
    meta: { requiresAuth: true }
  },
  // Legacy routes for backward compatibility
  {
    path: '/folder/:id',
    redirect: to => {
      // Map old folder routes to new structure
      const folderMap: Record<string, string> = {
        'Inbox': '/dashboard',
        'Outbox': '/documents',
        'Favorites': '/documents',
        'Archived': '/documents',
        'Trash': '/documents',
        'Spam': '/documents'
      }
      return folderMap[to.params.id as string] || '/dashboard'
    }
  },
  // 404 fallback
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  const requiresAuth = to.meta.requiresAuth !== false
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login
    next('/login')
  } else if (!requiresAuth && authStore.isAuthenticated && to.path === '/login') {
    // If user is authenticated and trying to access login, redirect to dashboard
    next('/dashboard')
  } else {
    // Allow navigation
    next()
  }
})

export default router