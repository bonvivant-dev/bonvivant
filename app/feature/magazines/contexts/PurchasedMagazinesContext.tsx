import React, { createContext, useContext, ReactNode } from 'react'

import type { Magazine } from '../types'

interface PurchasedMagazinesContextType {
  magazines: Magazine[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const PurchasedMagazinesContext = createContext<
  PurchasedMagazinesContextType | undefined
>(undefined)

export function usePurchasedMagazinesContext() {
  const context = useContext(PurchasedMagazinesContext)
  if (!context) {
    // Context가 없으면 기본값 반환
    return {
      magazines: [],
      loading: false,
      error: null,
      refetch: async () => {},
    }
  }
  return context
}

interface PurchasedMagazinesProviderProps {
  children: ReactNode
  magazines: Magazine[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function PurchasedMagazinesProvider({
  children,
  magazines,
  loading,
  error,
  refetch,
}: PurchasedMagazinesProviderProps) {
  return (
    <PurchasedMagazinesContext.Provider
      value={{ magazines, loading, error, refetch }}
    >
      {children}
    </PurchasedMagazinesContext.Provider>
  )
}
