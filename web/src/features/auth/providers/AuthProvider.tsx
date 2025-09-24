'use client'

import { useAuthInitialization } from '@/features/auth/store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthInitialization()
  return <>{children}</>
}
