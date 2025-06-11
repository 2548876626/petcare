import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

import './assets/main.css'

// 创建应用实例
const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 添加全局页面可见性变化处理
let isAppActive = true;

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !isAppActive) {
    // 页面从隐藏变为可见时，且应用处于非活动状态
    console.log('页面重新变为可见，刷新应用状态');
    isAppActive = true;
    
    // 触发自定义事件，通知应用刷新状态
    window.dispatchEvent(new CustomEvent('app-visibility-change', { 
      detail: { visible: true } 
    }));
    
    // 强制刷新当前路由
    const currentPath = window.location.pathname;
    router.replace(currentPath);
  } else if (document.visibilityState === 'hidden') {
    isAppActive = false;
  }
});

// 处理从其他应用返回的情况
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log('从缓存恢复页面，刷新应用状态');
    // 触发自定义事件，通知应用刷新状态
    window.dispatchEvent(new CustomEvent('app-visibility-change', { 
      detail: { visible: true, fromCache: true } 
    }));
    
    // 强制刷新当前路由
    const currentPath = window.location.pathname;
    router.replace(currentPath);
  }
});

// 创建Pinia实例
const pinia = createPinia()
app.use(pinia)

// 使用其他插件
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

// 初始化用户状态
const userStore = useUserStore()
userStore.initialize().catch((error: unknown) => {
  console.error('初始化用户状态失败:', error)
})

// 挂载应用
app.mount('#app') 