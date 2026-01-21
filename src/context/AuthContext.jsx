import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [userProfile, setUserProfile] = useState(null) // public.users data (credits etc)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 1. Get initial session
        // 1. Get initial session and VERIFY with server
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                // 用于安全验证：getSession 可能返回本地缓存的过斯 session
                // getUser() 会向 Supabase 发送请求验证 Token 有效性及用户是否存在
                const { data: { user }, error } = await supabase.auth.getUser()

                if (error || !user) {
                    console.warn('Local session invalid or user deleted on server. Signing out.')
                    await supabase.auth.signOut()
                    setSession(null)
                    setUser(null)
                } else {
                    setSession(session)
                    setUser(user)
                    fetchUserProfile(user.id)
                }
            }
            setLoading(false)
        }
        initAuth()

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchUserProfile(session.user.id)
            } else {
                setUserProfile(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                // 如果是“查不到数据” (PGRST116)，说明触发器可能挂了。
                // 我们在前端补救：手动插入一条初始化记录。
                if (error.code === 'PGRST116' || error.message?.includes('JSON object requested, but 0 rows were returned')) {
                    console.warn('Profile missing. Attempting lazy initialization...')

                    const { error: insertError } = await supabase.from('users').insert({
                        id: userId,
                        email: supabase.auth.user()?.email || 'user', // 尝试获取 email，虽不严谨但够用
                        credits: 5
                    })

                    if (insertError) {
                        console.error('Lazy init failed:', insertError)
                    } else {
                        // 插入成功，重试读取
                        console.log('Lazy init success. Retrying fetch...')
                        return fetchUserProfile(userId)
                    }
                } else {
                    console.error('Error fetching user profile:', error)
                }
            } else {
                setUserProfile(data)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const value = {
        session,
        user,
        userProfile,
        loading,
        refreshProfile: () => user && fetchUserProfile(user.id),
        signInWithEmail: (email) => supabase.auth.signInWithOtp({ email }),
        verifyEmailOtp: (email, token) => supabase.auth.verifyOtp({ email, token, type: 'email' }),
        signOut: () => supabase.auth.signOut(),
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
