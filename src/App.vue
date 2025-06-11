<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 用于强制路由视图重新渲染的 key
const routerViewKey = ref(0)

// 监听路由变化
watch(() => route.fullPath, () => {
  // 路由变化时增加 key，强制重新渲染
  routerViewKey.value++
})

// 处理应用可见性变化
function handleAppVisibilityChange(event: Event) {
  console.log('收到应用可见性变化事件');
  
  // 强制刷新路由视图
  routerViewKey.value++
  
  // 确保当前路由状态与URL匹配
  const currentPath = window.location.pathname
  if (route.path !== currentPath && currentPath !== '/') {
    console.log(`路由不匹配，当前路径: ${route.path}，应为: ${currentPath}`);
    router.replace(currentPath)
  }
  
  // 重新绑定事件监听器
  rebindEventListeners()
}

// 重新绑定所有事件监听器
function rebindEventListeners() {
  console.log('重新绑定事件监听器');
  
  // 先移除旧的监听器
  document.removeEventListener('click', handleDocumentClick)
  
  // 添加新的监听器
  document.addEventListener('click', handleDocumentClick)
  
  // 触发点击事件，确保元素可点击
  setTimeout(() => {
    const navItems = document.querySelectorAll('nav a, nav .el-menu-item, button')
    navItems.forEach(item => {
      item.classList.add('clickable')
    })
  }, 100)
}

onMounted(() => {
  // 添加页面可见性变化监听器
  window.addEventListener('app-visibility-change', handleAppVisibilityChange)
  
  // 添加点击事件监听，确保所有链接点击都能正常工作
  document.addEventListener('click', handleDocumentClick)
  
  // 添加页面显示监听器
  window.addEventListener('pageshow', handlePageShow)
})

onUnmounted(() => {
  window.removeEventListener('app-visibility-change', handleAppVisibilityChange)
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('pageshow', handlePageShow)
})

// 处理页面显示事件
function handlePageShow(event: PageTransitionEvent) {
  if (event.persisted) {
    console.log('页面从缓存恢复，刷新应用状态');
    routerViewKey.value++
    rebindEventListeners()
  }
}

// 处理文档级别的点击事件
function handleDocumentClick(event: MouseEvent) {
  // 检查点击的是否是导航链接
  const target = event.target as HTMLElement
  const navLink = target.closest('a[href]')
  
  if (navLink && navLink.getAttribute('href')?.startsWith('/')) {
    // 阻止默认行为，使用我们的路由导航
    event.preventDefault()
    const path = navLink.getAttribute('href') || '/'
    handleNavClick(path)
  }
}

// 导航链接数组
const navLinks = [
  { name: '首页', path: '/' },
  { name: '服务列表', path: '/services' },
  { name: '社区动态', path: '/community' },
  { name: '社区相册', path: '/gallery' },
  { name: '关于我们', path: '/about' }
]

// 当前活动路由
const activeIndex = computed(() => route.path)

// 计算用户是否已登录
const isLoggedIn = computed(() => userStore.isAuthenticated)

// 退出登录
const logout = async () => {
  try {
    const { success, error } = await userStore.logout()
    if (success) {
      ElMessage.success('已成功退出登录')
      router.push('/')
    } else {
      ElMessage.error(error || '退出登录失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '退出登录时发生错误')
  }
}

// 跳转到登录页面
const goToLogin = () => {
  routerViewKey.value++
  router.push('/login')
}

// 跳转到注册页面
const goToRegister = () => {
  routerViewKey.value++
  router.push('/register')
}

// 跳转到我的账户页面
const goToMyAccount = () => {
  routerViewKey.value++
  router.push('/account')
}

// 跳转到直播控制室
const goToBroadcastDashboard = () => {
  console.log('点击了直播控制室')
  routerViewKey.value++
  window.location.href = '/admin/broadcast'
}

// 跳转到直播观看页面
const goToLiveRoom = () => {
  console.log('点击了观看直播')
  routerViewKey.value++
  window.location.href = '/live'
}

// 添加点击事件处理器，确保导航正常工作
const handleNavClick = (path: string) => {
  // 强制重新渲染路由视图
  routerViewKey.value++
  
  // 使用window.location直接导航，确保在任何情况下都能正常工作
  window.location.href = path
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="logo" @click="handleNavClick('/')">
        <img src="/favicon.svg" alt="宠爱社区" class="logo-img" />
        <span class="logo-text">宠爱社区</span>
      </div>
      
      <nav class="nav">
        <el-menu mode="horizontal" router :default-active="activeIndex">
          <el-menu-item 
            v-for="link in navLinks.filter(l => l.name !== '直播间')" 
            :key="link.path" 
            :index="link.path"
            @click="(e: MouseEvent) => { e.preventDefault(); handleNavClick(link.path); }"
          >
            {{ link.name }}
          </el-menu-item>
          
          <!-- 直播功能 -->
          <el-menu-item index="/live-room" @click="goToLiveRoom">
            直播间
          </el-menu-item>
        </el-menu>
      </nav>
      
      <div class="user-actions">
        <template v-if="isLoggedIn">
          <el-dropdown>
            <el-button type="primary">
              {{ userStore.profile?.name || '我的账户' }} <el-icon><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToMyAccount">我的账户</el-dropdown-item>
                <el-dropdown-item @click="goToBroadcastDashboard">直播控制室</el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button @click="goToLogin">登录</el-button>
          <el-button type="primary" @click="goToRegister">注册</el-button>
        </template>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component }" :key="routerViewKey">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="/favicon.svg" alt="宠爱社区" class="logo-img small" />
          <span class="logo-text">宠爱社区</span>
        </div>
        <div class="footer-links">
          <a @click.prevent="handleNavClick('/about')" class="footer-link">关于我们</a>
          <a @click.prevent="handleNavClick('/community')" class="footer-link">社区动态</a>
          <a @click.prevent="handleNavClick('/services')" class="footer-link">服务列表</a>
          <a @click.prevent="handleNavClick('/gallery')" class="footer-link">社区相册</a>
          <a @click.prevent="goToLiveRoom" class="footer-link">观看直播</a>
          <a v-if="isLoggedIn" @click.prevent="goToBroadcastDashboard" class="footer-link">直播控制室</a>
        </div>
        <div class="copyright">
          © {{ new Date().getFullYear() }} 宠爱社区 - PetCare Community. 保留所有权利
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid #eaeaea;
  background-color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-img {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.logo-img.small {
  width: 30px;
  height: 30px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.nav {
  flex: 1;
  margin: 0 20px;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.main-content {
  flex: 1;
  padding: 20px;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.footer {
  background-color: #f8f9fa;
  padding: 20px;
  margin-top: auto;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.footer-links {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.footer-link {
  color: #666;
  text-decoration: none;
  cursor: pointer;
}

.footer-link:hover {
  color: #409eff;
}

.copyright {
  color: #999;
  font-size: 14px;
}
</style> 