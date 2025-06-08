import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, type User, type Session } from '@/lib/supabaseClient'

// 用户信息接口
interface UserProfile {
  id: string
  name: string
  email: string
  created_at: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value)

  // 初始化用户状态
  const initialize = async () => {
    // 获取当前会话
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      session.value = data.session
      user.value = data.session.user
      await fetchUserProfile()
    }

    // 监听身份验证状态变化
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
      
      if (newSession) {
        await fetchUserProfile()
      } else {
        profile.value = null
      }
    })
  }

  // 获取用户资料
  const fetchUserProfile = async () => {
    if (!user.value) return

    try {
      loading.value = true
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        profile.value = data as UserProfile
      }
    } catch (error) {
      console.error('获取用户资料失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 用户登录
  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) throw error
      
      return { success: true, data }
    } catch (error: any) {
      console.error('登录失败:', error.message)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 用户注册
  const register = async (email: string, password: string, name: string) => {
    try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    let errorMessage = '注册发生未知错误';
    if (error.message) {
      if (error.message.includes('User already registered')) {
        errorMessage = '这个邮箱已经被人注册过了啦！';
      } else if (error.message.includes('violates row-level security policy')) {
        // 这个是给我们自己看的，除错用的
        errorMessage = '资料库安全设定出问题了，请联络管理员喔！';
      }
      else {
        errorMessage = error.message;
      }
    }
    return { success: false, error: errorMessage };
  }
}

  // 用户退出登录
  const logout = async () => {
    try {
      loading.value = true
      await supabase.auth.signOut()
      
      // 清除状态
      user.value = null
      session.value = null
      profile.value = null
      
      return { success: true }
    } catch (error: any) {
      console.error('退出登录失败:', error.message)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 更新用户资料
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user.value) return { success: false, error: '用户未登录' }

    try {
      loading.value = true
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
      
      if (error) throw error
      
      // 更新本地状态
      if (profile.value) {
        profile.value = { ...profile.value, ...updates }
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('更新资料失败:', error.message)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    user,
    session,
    profile,
    loading,
    
    // 计算属性
    isAuthenticated,
    
    // 方法
    initialize,
    fetchUserProfile,
    login,
    register,
    logout,
    updateProfile
  }
}) 