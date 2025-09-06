import { SupabaseClient, User, Session } from '@supabase/supabase-js'
import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import * as WebBrowser from 'expo-web-browser'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Alert, Platform } from 'react-native'

import { AuthErrorMessage } from '../constants'
import { supabase } from '../lib'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean }>
  signOut: () => Promise<void>
  supabase: SupabaseClient
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const redirectTo = makeRedirectUri({
  scheme: 'bonvivant',
})

const isAndroid = Platform.OS === 'android'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url)

    if (errorCode) {
      throw new Error(`Error code: ${errorCode}`)
    }

    const { access_token, refresh_token } = params

    if (!access_token || !refresh_token) {
      throw new Error('Missing required token parameters')
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

    if (sessionError) throw sessionError
    return sessionData.session
  }

  const signInWithGoogle = async () => {
    try {
      // WebBrowser warming up for better performance on Android
      if (isAndroid) {
        await WebBrowser.warmUpAsync()
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })
      if (error) throw error

      const res = await WebBrowser.openAuthSessionAsync(
        data?.url ?? '',
        redirectTo
      )

      if (res.type === 'success') {
        const { url } = res
        await createSessionFromUrl(url)
      } else {
        console.log('사용자가 로그인을 취소하거나 오류 발생')
      }
    } catch (err) {
      Alert.alert('예외', `예외 발생: ${err}`)
      throw err
    } finally {
      // Clean up WebBrowser on Android
      if (isAndroid) {
        WebBrowser.coolDownAsync()
      }
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // 세션과 사용자 정보를 명시적으로 설정
      if (data.session && data.user) {
        setSession(data.session)
        setUser(data.user)
      }
    } catch (error) {
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'bonvivant://auth-callback',
        },
      })

      if (error) throw error

      if (data.user && data.user.email_confirmed_at !== null) {
        throw new Error(AuthErrorMessage.USER_ALREADY_REGISTERED)
      }

      return { success: true }
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      setSession(null)

      // Clean up WebBrowser session on Android if needed
      if (isAndroid) {
        try {
          await WebBrowser.coolDownAsync()
        } catch (error) {
          console.warn('WebBrowser cooldown failed:', error)
        }
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        // Don't throw error if it's just AuthSession missing
        if (!error.message.includes('Auth session missing')) {
          throw error
        }
      }
    } catch (error) {
      setUser(null)
      setSession(null)

      // Only throw if it's not an AuthSession missing error
      if (!(error as Error).message?.includes('Auth session missing')) {
        throw error
      }
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    supabase,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
