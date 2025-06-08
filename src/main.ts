import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()
app.use(pinia)

// 使用其他插件
app.use(router)
app.use(ElementPlus)

// 初始化用户状态
const userStore = useUserStore()
userStore.initialize().catch((error: unknown) => {
  console.error('初始化用户状态失败:', error)
})

// 挂载应用
app.mount('#app') 