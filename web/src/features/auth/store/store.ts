import { User } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  loading: boolean
  isAdmin: boolean
  isSigningOut: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setIsAdmin: (isAdmin: boolean) => void
  setIsSigningOut: (isSigningOut: boolean) => void
  reset: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  loading: true,
  isAdmin: false,
  isSigningOut: false,
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setIsSigningOut: (isSigningOut) => set({ isSigningOut }),
  reset: () => set(initialState),
}))