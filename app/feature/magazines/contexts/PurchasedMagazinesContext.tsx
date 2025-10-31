import React, { createContext, useContext, ReactNode } from 'react'

interface PurchasedMagazinesContextType {
  refetchPurchasedMagazines: () => Promise<void>
}

const PurchasedMagazinesContext = createContext<
  PurchasedMagazinesContextType | undefined
>(undefined)

export function usePurchasedMagazinesContext() {
  const context = useContext(PurchasedMagazinesContext)
  if (!context) {
    // Context가 없으면 no-op 함수 반환 (구매 페이지가 library 외부에서도 사용될 수 있음)
    return {
      refetchPurchasedMagazines: async () => {},
    }
  }
  return context
}

interface PurchasedMagazinesProviderProps {
  children: ReactNode
  refetch: () => Promise<void>
}

export function PurchasedMagazinesProvider({
  children,
  refetch,
}: PurchasedMagazinesProviderProps) {
  return (
    <PurchasedMagazinesContext.Provider
      value={{ refetchPurchasedMagazines: refetch }}
    >
      {children}
    </PurchasedMagazinesContext.Provider>
  )
}
