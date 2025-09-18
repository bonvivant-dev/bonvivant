'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/features/auth'

export default function Home() {
  const router = useRouter()
  const { user, loading, isAdmin } = useAuth()

  useEffect(() => {
    if (user && isAdmin) {
      router.replace('/admin')
    }
  }, [user, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return null
}
