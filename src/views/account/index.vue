<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 页面加载状态
const loading = ref(true)

// 表单引用
const profileFormRef = ref<FormInstance>()

// 表单数据
const profileForm = reactive({
  name: '',
  email: ''
})

// 表单验证规则
const profileRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
})

// 初始化页面
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  
  try {
    // 获取用户资料
    await userStore.fetchUserProfile()
    
    // 填充表单数据
    if (userStore.profile) {
      profileForm.name = userStore.profile.name
      profileForm.email = userStore.profile.email
    }
  } catch (error) {
    console.error('获取用户资料失败:', error)
    ElMessage.error('获取用户资料失败')
  } finally {
    loading.value = false
  }
})

// 更新个人资料
const updateProfile = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        
        // 调用更新方法
        const { success, error } = await userStore.updateProfile({
          name: profileForm.name
        })
        
        if (success) {
          ElMessage.success('个人资料更新成功')
        } else {
          ElMessage.error(error || '更新失败，请稍后再试')
        }
      } finally {
        loading.value = false
      }
    }
  })
}

// 退出登录
const logout = async () => {
  try {
    loading.value = true
    await userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="account-page">
    <div class="account-container">
      <h2 class="page-title">我的账户</h2>
      
      <el-card class="account-card" v-loading="loading">
        <template #header>
          <div class="card-header">
            <h3>个人资料</h3>
          </div>
        </template>
        
        <el-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          label-position="top"
          class="profile-form"
        >
          <el-form-item label="用户名" prop="name">
            <el-input v-model="profileForm.name" />
          </el-form-item>
          
          <el-form-item label="邮箱">
            <el-input v-model="profileForm.email" disabled />
            <div class="form-help">邮箱地址不可修改</div>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="updateProfile(profileFormRef)">
              保存修改
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <el-card class="account-card">
        <template #header>
          <div class="card-header">
            <h3>账户操作</h3>
          </div>
        </template>
        
        <div class="account-actions">
          <el-button type="danger" @click="logout">退出登录</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.account-page {
  padding: 40px 20px;
}

.account-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 30px;
}

.account-card {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.profile-form {
  max-width: 500px;
}

.form-help {
  font-size: 0.9rem;
  color: #999;
  margin-top: 5px;
}

.account-actions {
  display: flex;
  gap: 15px;
}
</style> 