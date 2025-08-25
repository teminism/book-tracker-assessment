import { createRouter, createWebHistory } from 'vue-router'

const MyBooks = () => import('../views/MyBooks.vue')
const Analytics = () => import('../views/Analytics.vue')
const Settings = () => import('../views/Settings.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/books' },
    { path: '/books', name: 'books', component: MyBooks },
    { path: '/analytics', name: 'analytics', component: Analytics },
    { path: '/settings', name: 'settings', component: Settings }
  ]
})

export default router


