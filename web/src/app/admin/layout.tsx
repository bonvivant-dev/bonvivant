'use client'

import '../globals.css'

import { AuthProvider, useAuth } from '@/features/auth'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            접근 권한이 없습니다
          </h2>
          <p className="text-gray-600">관리자 권한이 필요한 페이지입니다.</p>
          <button
            onClick={signOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  )
}
