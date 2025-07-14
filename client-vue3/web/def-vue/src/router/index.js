import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'app-list',
      component: () => import('../views/AppList.vue'),
    },
  ],
})

export default router
