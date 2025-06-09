<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const registerFormRef = ref<FormInstance>()

// 表单数据
const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 验证密码是否一致
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 验证密码复杂度
const validatePassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
    return
  }
  
  // 检查密码是否包含小写字母、大写字母和数字
  const hasLowerCase = /[a-z]/.test(value)
  const hasUpperCase = /[A-Z]/.test(value)
  const hasNumber = /[0-9]/.test(value)
  
  if (value.length < 6) {
    callback(new Error('密码长度不能少于6个字符'))
  } else if (!(hasLowerCase && hasUpperCase && hasNumber)) {
    callback(new Error('密码必须包含小写字母、大写字母和数字'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
})

// 注册中状态
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
        
        // 调用注册方法
        const { success, error } = await userStore.register(
          registerForm.email,
          registerForm.password,
          registerForm.name
        )
        
        if (success) {
          ElMessage.success('注册成功，请登录')
          router.push('/login')
        } else {
          errorMsg.value = error || '注册失败，请稍后再试'
          ElMessage.error(errorMsg.value)
        }
      } catch (error: any) {
        errorMsg.value = error.message || '注册时发生错误'
        ElMessage.error(errorMsg.value)
      } finally {
        loading.value = false
      }
    }
  })
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h2 class="register-title">加入宠爱社区</h2>
        <p class="register-subtitle">创建您的宠爱社区账号</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
        class="register-form"
      >
        <el-form-item label="用户名" prop="name">
          <el-input
            v-model="registerForm.name"
            placeholder="请输入您的用户名"
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入您的邮箱"
            type="email"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            placeholder="请输入密码"
            type="password"
            show-password
          />
          <div class="el-form-item__tip">
            密码必须包含小写字母、大写字母和数字，长度不少于6位。
          </div>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            placeholder="请再次输入密码"
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
            @click="submitForm(registerFormRef)"
            class="submit-btn"
          >
            注册
          </el-button>
        </div>
      </el-form>
      
      <div class="form-footer">
        <p>
          已有账号？
          <el-button link type="primary" @click="goToLogin">立即登录</el-button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f5f7fa;
}

.register-container {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 16px;
  color: #666;
}

.register-form {
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

.el-form-item__tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  margin: 5px 0;
  text-align: center;
}
</style> 