import React, { createContext, useContext, ReactNode } from 'react'

import type { Magazine } from '../types'

interface BookmarksContextType {
  magazines: Magazine[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(
  undefined
)

export function useBookmarksContext() {
  const context = useContext(BookmarksContext)
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

interface BookmarksProviderProps {
  children: ReactNode
  magazines: Magazine[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function BookmarksProvider({
  children,
  magazines,
  loading,
  error,
  refetch,
}: BookmarksProviderProps) {
  return (
    <BookmarksContext.Provider value={{ magazines, loading, error, refetch }}>
      {children}
    </BookmarksContext.Provider>
  )
}
