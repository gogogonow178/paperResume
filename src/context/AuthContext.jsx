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
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) fetchUserProfile(session.user.id)
            setLoading(false)
        })

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
                console.error('Error fetching user profile:', error)
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
