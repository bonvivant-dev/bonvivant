import { User } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  loading: boolean
  isAdmin: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setIsAdmin: (isAdmin: boolean) => void
  reset: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  loading: true,
  isAdmin: false,
}

export const useAuthStore = create<AuthStore>(set => ({
  ...initialState,

  setUser: user => set({ user }),
  setLoading: loading => set({ loading }),
  setIsAdmin: isAdmin => set({ isAdmin }),
  reset: () => set(initialState),
}))
