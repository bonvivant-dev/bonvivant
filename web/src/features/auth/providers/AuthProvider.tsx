'use client'

import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

import { supabaseBrowserClient } from '@/shared/utils/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  isAdmin: boolean
  isSigningOut: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabaseBrowserClient.auth.getSession()

        if (error) {
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await checkAdminStatus(session.user)
        } else {
          setIsAdmin(false)
          setLoading(false)
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseBrowserClient.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await checkAdminStatus(session.user)
      } else {
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = async (user: User) => {
    try {
      const { data: profile, error } = await supabaseBrowserClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        const { data: newProfile, error: insertError } =
          await supabaseBrowserClient
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email || '',
                role: 'user',
              },
            ])
            .select()
            .single()

        if (!insertError && newProfile) {
          setIsAdmin(newProfile.role === 'admin')
        } else {
          setIsAdmin(false)
        }
      } else if (profile) {
        setIsAdmin(profile.role === 'admin')
      } else {
        const { data: newProfile, error: insertError } =
          await supabaseBrowserClient
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email || '',
                role: 'user',
              },
            ])
            .select()
            .single()

        if (!insertError && newProfile) {
          setIsAdmin(newProfile.role === 'admin')
        } else {
          setIsAdmin(false)
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    const confirmed = window.confirm('로그아웃하시겠습니까?')
    if (!confirmed) return

    try {
      setIsSigningOut(true)
      const { error } = await supabaseBrowserClient.auth.signOut()
      if (error) throw error

      setUser(null)
      setSession(null)
      setIsAdmin(false)
      router.replace('/login')
    } catch (error) {
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      setIsSigningOut(false)
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
    isAdmin,
    isSigningOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
