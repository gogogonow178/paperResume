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
                // Supabase .single() 如果找不到数据会返回 406 / PGRST116 错误
                if (error.code === 'PGRST116' || error.message?.includes('JSON object requested, but 0 rows were returned')) {
                    console.warn('User deleted in database. Forcing logout.')
                    await supabase.auth.signOut()
                    setUser(null)
                    setSession(null)
                    setUserProfile(null)
                    window.location.reload() // 彻底重置
                } else {
                    console.error('Error fetching user profile:', error)
                }
            } else if (!data) {
                console.warn('Empty profile data. Forcing logout.')
                await supabase.auth.signOut()
                setUser(null)
                setSession(null)
                setUserProfile(null)
                window.location.reload() // 彻底重置
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
