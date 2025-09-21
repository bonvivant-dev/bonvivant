import { useCallback, useEffect } from 'react'

import { authService } from './service'
import { useAuthStore } from './store'

export function useAuth() {
  const store = useAuthStore()

  const signOut = useCallback(async () => {
    try {
      store.setIsSigningOut(true)
      await authService.signOut()
      store.reset()
      window.location.href = '/'
    } catch (error) {
      store.reset()
      throw error
    }
  }, [store])

  return {
    ...store,
    signOut,
  }
}

export function useAuthInitialization() {
  const { setUser, setLoading, setIsAdmin } = useAuthStore()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initialize = async () => {
      try {
        const session = await authService.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          const isAdmin = await authService.checkAdminStatus(session.user)
          setIsAdmin(isAdmin)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setLoading(false)
      }

      const {
        data: { subscription },
      } = authService.onAuthStateChange(async user => {
        setUser(user)

        if (user) {
          const isAdmin = await authService.checkAdminStatus(user)
          setIsAdmin(isAdmin)
        } else {
          setIsAdmin(false)
        }

        setLoading(false)
      })

      unsubscribe = () => subscription.unsubscribe()
    }

    initialize()

    return () => {
      unsubscribe?.()
    }
  }, [setUser, setLoading, setIsAdmin])
}
