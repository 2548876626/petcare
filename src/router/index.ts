import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false, redirectIfLoggedIn: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/register/index.vue'),
    meta: { requiresAuth: false, redirectIfLoggedIn: true }
  },
  {
    path: '/services',
    name: 'services',
    component: () => import('@/views/services/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@/views/account/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: { requiresAuth: false }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫
router.beforeEach(async (to, from, next) => {
  // 检查路由是否需要身份验证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const redirectIfLoggedIn = to.matched.some(record => record.meta.redirectIfLoggedIn)
  
  // 获取当前会话
  const { data } = await supabase.auth.getSession()
  const isLoggedIn = !!data.session
  
  // 路由逻辑
  if (requiresAuth && !isLoggedIn) {
    // 需要登录但未登录，重定向到登录页
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (redirectIfLoggedIn && isLoggedIn) {
    // 已登录但访问登录页或注册页，重定向到首页
    next({ name: 'home' })
  } else {
    // 正常导航
    next()
  }
})

export default router 