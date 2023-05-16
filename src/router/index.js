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
      path: '/seats-generator',
      component: ()=>import('../views/SeatsGenerator.vue') 
    },
    {
      path: '/dynamic-rank',
      component: ()=>import('../views/DynamicRank.vue')
    },
    {
      path: '/dynamic-rank-settings',
      component: ()=>import('../views/DynamicRankSettings.vue')
    },
    {
      path: '/resolver',
      component: ()=>import('../views/Resolver.vue')
    },
    {
      path: '/resolver-rank',
      component: ()=>import('../views/ResolverRank.vue')
    }
  ]
})

// Export
export default router
