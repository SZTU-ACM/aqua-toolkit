/* Router */
import { createRouter, createWebHistory } from 'vue-router'

// Router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: ()=>import('../views/Index.vue')
    },
    {
      path: '/st-gen',
      component: ()=>import('../views/SeatsGenerator.vue')
    },
    {
      path: '/res',
      component: ()=>import('../views/Resolver.vue')
    },
    {
      path: '/res-rnk',
      component: ()=>import('../views/ResolverRank.vue')
    }
  ]
})

// Export
export default router