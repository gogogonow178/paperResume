import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 简单的 URL 格式验证
const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// 防白屏保护：如果配置不对，不创建真实的 Client，避免 Uncaught Error
let client

if (isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseUrl.includes('your_supabase_project_url')) {
  client = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('⚠️ Supabase 配置无效：请检查 .env.local 文件。以 Mock 模式运行。')
  // 返回一个 Dummy Client 避免调用报错
  client = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithOtp: () => Promise.resolve({ error: { message: 'Supabase 未配置' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }), // Fix useEffect cleanup
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => Promise.resolve({ error: null }),
    }),
    rpc: () => Promise.resolve({ data: null, error: null })
  }
}

export const supabase = client
