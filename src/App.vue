<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user'

const router = useRouter()
const userStore = useUserStore()

// 计算用户是否已登录
const isLoggedIn = computed(() => userStore.isAuthenticated)

// 退出登录
const logout = async () => {
  await userStore.logout()
  router.push('/login')
}

// 跳转到我的账户页面
const goToMyAccount = () => {
  router.push('/account')
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="logo" @click="router.push('/')">
        <img src="/favicon.svg" alt="宠爱社区" class="logo-img" />
        <span class="logo-text">宠爱社区</span>
      </div>
      
      <nav class="nav">
        <el-menu mode="horizontal" router>
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/services">服务列表</el-menu-item>
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
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button @click="router.push('/login')">登录</el-button>
          <el-button type="primary" @click="router.push('/register')">注册</el-button>
        </template>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="/favicon.svg" alt="宠爱社区" class="logo-img small" />
          <span class="logo-text">宠爱社区</span>
        </div>
        <div class="footer-links">
          <a href="#" class="footer-link">关于我们</a>
          <a href="#" class="footer-link">联系方式</a>
          <a href="#" class="footer-link">服务条款</a>
          <a href="#" class="footer-link">隐私政策</a>
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
}

.footer-link:hover {
  color: #409eff;
}

.copyright {
  color: #999;
  font-size: 14px;
}
</style> 