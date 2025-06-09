import { createClient } from '@supabase/supabase-js'

// 获取环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查环境变量是否已定义
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少必要的Supabase环境变量。请检查环境变量配置是否正确。')
}

// 创建Supabase客户端
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// 导出类型
export type { User, Session } from '@supabase/supabase-js'

// 导出通用类型
export type Profile = {
  id: string
  name: string
  avatar_url?: string
  created_at: string
} 