import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [userProfile, setUserProfile] = useState(null) // public.users data (credits etc)
    const [loading, setLoading] = useState(true)

    // 请求去重：跟踪进行中的 profile 请求
    const fetchingProfileRef = useRef(null)

    useEffect(() => {
        // 1. Get initial session
        const initAuth = async () => {
            try {
                // 安全获取 session，避免 throw error 导致 loading 卡死
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    console.warn('Session init warning:', sessionError)
                    // session error 通常意味着没登录或 token 过期，不一定需要 throw
                }

                if (session?.user) {
                    // 用于安全验证：getSession 可能返回本地缓存的过斯 session
                    // getUser() 会向 Supabase 发送请求验证 Token 有效性及用户是否存在
                    const { data: { user }, error } = await supabase.auth.getUser()

                    if (error || !user) {
                        console.warn('Local session invalid or user deleted on server. Signing out.')
                        await supabase.auth.signOut()
                        setSession(null)
                        setUser(null)
                        setUserProfile(null)
                    } else {
                        setSession(session)
                        setUser(user)
                        // 这是一个异步操作，但我们不需要 await 它阻断 UI 渲染
                        // 让 profile 在后台加载，UI 可以先显示“加载中”或骨架屏
                        // 但为了防止闪烁，这里可以选择 wait，或者让 children 里的组件处理 profile null
                        await fetchUserProfile(user.id, user.email)
                    }
                }
            } catch (err) {
                console.error('Auth initialization failed:', err)
                // 即使失败，也要把 loading 关掉，否则用户永远卡在白屏
            } finally {
                setLoading(false)
            }
        }
        initAuth()

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state change:', _event, session?.user?.email)
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                fetchUserProfile(session.user.id, session.user.email)
            } else {
                setUserProfile(null)
                // 确保登出时清理干净
            }

            // 某些事件（如 PASSWOR_RECOVERY）可能不需要立刻关 loading，
            // 但通常 onAuthStateChange 触发意味着状态已确立
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchUserProfile = async (userId, userEmail) => {
        // 请求去重：如果同一用户已有进行中的请求，直接返回该 Promise
        if (fetchingProfileRef.current === userId) {
            return
        }
        fetchingProfileRef.current = userId

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                // 如果是"查不到数据" (PGRST116)，说明触发器可能挂了。
                // 我们在前端补救：手动插入一条初始化记录。
                if (error.code === 'PGRST116' || error.message?.includes('JSON object requested, but 0 rows were returned')) {
                    console.warn('Profile missing. Attempting lazy initialization...')

                    // 优先使用传入的 Email，否则尝试从 Session 获取
                    let email = userEmail
                    if (!email) {
                        const { data: { user } } = await supabase.auth.getUser()
                        email = user?.email
                    }

                    if (!email) {
                        console.error('Lazy init failed: Email not found')
                        setUserProfile({ credits: 0, is_temp: true })
                        // 不再 return，允许页面带着空数据继续渲染，避免白屏
                        return
                    }

                    const { error: insertError } = await supabase.from('users').insert({
                        id: userId,
                        email: email,
                        credits: 5
                    })

                    if (insertError) {
                        console.error('Lazy init failed:', insertError)
                        setUserProfile({ credits: 0, is_temp: true }) // 临时兜底，防白屏
                    } else {
                        console.log('Lazy init success.')
                        // 直接设置内存状态，不再递归请求，彻底杜绝死循环风险
                        setUserProfile({ id: userId, email, credits: 5 })
                    }
                } else {
                    console.error('Error fetching user profile:', error)
                    // 出错也给个兜底，防止 UI 炸裂
                    setUserProfile({ credits: 0, is_temp: true })
                }
            } else {
                setUserProfile(data)
            }
        } catch (error) {
            console.error('Error:', error)
            setUserProfile({ credits: 0, is_temp: true })
        } finally {
            // 请求完成，清除标记
            fetchingProfileRef.current = null
        }
    }

    const value = {
        session,
        user,
        userProfile,
        loading,
        refreshProfile: () => user && fetchUserProfile(user.id, user.email),
        signInWithEmail: (email, fingerprint) => supabase.auth.signInWithOtp({
            email,
            options: {
                data: { fingerprint }
            }
        }),
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
