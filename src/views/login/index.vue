<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  email: '',
  password: ''
})

// 表单验证规则
const loginRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
})

// 登录中状态
const loading = ref(false)
// 错误信息
const errorMsg = ref('')

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  errorMsg.value = ''
  
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        
        // 调用登录方法
        const { success, error } = await userStore.login(loginForm.email, loginForm.password)
        
        if (success) {
          ElMessage.success('登录成功')
          
          // 如果有重定向参数，则跳转到该页面，否则跳转到首页
          const redirectPath = route.query.redirect as string || '/'
          router.push(redirectPath)
        } else {
          errorMsg.value = error || '登录失败，请检查您的邮箱和密码'
          ElMessage.error(errorMsg.value)
        }
      } catch (error: any) {
        errorMsg.value = error.message || '登录时发生错误'
        ElMessage.error(errorMsg.value)
      } finally {
        loading.value = false
      }
    }
  })
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-subtitle">登录您的宠爱社区账号</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        class="login-form"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入您的邮箱"
            type="email"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入您的密码"
            type="password"
            show-password
          />
        </el-form-item>
        
        <div v-if="errorMsg" class="error-message">
          {{ errorMsg }}
        </div>
        
        <div class="form-actions">
          <el-button
            type="primary"
            :loading="loading"
            @click="submitForm(loginFormRef)"
            class="submit-btn"
          >
            登录
          </el-button>
        </div>
      </el-form>
      
      <div class="form-footer">
        <p>
          还没有账号？
          <el-button link type="primary" @click="goToRegister">立即注册</el-button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f5f7fa;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 16px;
  color: #666;
}

.login-form {
  margin-bottom: 20px;
}

.form-actions {
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.form-footer {
  text-align: center;
  color: #666;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  margin: 5px 0;
  text-align: center;
}
</style> 