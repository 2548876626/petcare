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
    path: '/community',
    name: 'Community',
    component: () => import('@/views/community/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/album',
    name: 'Album',
    component: () => import('@/views/gallery/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: () => import('@/views/post/PostDetail.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/views/gallery/index.vue'),
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
  },
  {
    path: '/live', 
    name: 'LiveEntry',
    component: () => import('@/views/live/LiveEntry.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/live-room', // 这是观众看的页面
    name: 'LiveRoom',
    component: () => import('@/views/live/LiveRoom.vue'), // 我们等一下会创建这个文件
    meta: { requiresAuth: false }
  },
  {
    path: '/admin/broadcast', // 这是管理员用的页面
    name: 'AdminBroadcast',
    component: () => import('@/views/admin/BroadcastDashboard.vue'), // 我们等一下会创建这个文件
    meta: { requiresAuth: true } // 加上这个，代表这个页面需要登录才能看
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 添加滚动行为控制
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（例如通过后退按钮回到页面），则使用它
    if (savedPosition) {
      return savedPosition;
    }
    
    // 如果是从文章详情页返回到社区动态页面，使用保存的滚动位置
    if (from.name === 'PostDetail' && to.name === 'Community') {
      // 尝试从 sessionStorage 获取保存的滚动位置
      const communityScrollPos = sessionStorage.getItem('communityScrollPos');
      if (communityScrollPos) {
        return { top: parseInt(communityScrollPos), behavior: 'auto' };
      }
    }
    
    // 默认滚动到页面顶部
    return { top: 0 };
  }
})

// 导航守卫
router.beforeEach(async (to, from, next) => {
  // 检查路由是否需要身份验证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const redirectIfLoggedIn = to.matched.some(record => record.meta.redirectIfLoggedIn)
  
  // 获取当前会话
  const { data } = await supabase.auth.getSession()
  const isLoggedIn = !!data.session
  
  // 如果从社区动态页面进入文章详情页，保存滚动位置
  if (from.name === 'Community' && to.name === 'PostDetail') {
    sessionStorage.setItem('communityScrollPos', window.scrollY.toString());
  }
  
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

// 添加导航错误处理
router.onError((error) => {
  console.error('路由导航错误:', error)
})

// 添加导航解析处理
router.beforeResolve((to, from, next) => {
  // 确保路由组件已加载
  if (to.matched.length === 0) {
    // 如果没有匹配的路由，尝试刷新路由
    router.replace(to.fullPath)
  }
  next()
})

// 添加导航完成后的处理
router.afterEach((to, from) => {
  // 记录最后访问的路由，用于从其他平台返回时恢复
  sessionStorage.setItem('lastRoute', to.fullPath)
})

// 如果从其他平台返回，检查是否需要恢复路由状态
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', (event) => {
    // 当页面从缓存中恢复时(如从其他应用返回)
    if (event.persisted) {
      // 强制刷新路由状态
      const currentPath = window.location.pathname
      const lastRoute = sessionStorage.getItem('lastRoute')
      
      if (lastRoute && currentPath !== lastRoute) {
        router.replace(currentPath)
      }
    }
  })
}

export default router 