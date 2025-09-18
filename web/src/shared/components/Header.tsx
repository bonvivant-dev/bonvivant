import { usePathname, useRouter } from 'next/navigation'

import { useAuth } from '@/features/auth'


interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const isAdminMain = pathname === '/admin'

  const onClickBack = () => {
    router.back()
  }

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            {!isAdminMain && (
              <button
                onClick={onClickBack}
                className="text-blue-600 hover:text-blue-800 text-2xl font-large cursor-pointer"
              >
                ←
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.email} (관리자)
            </span>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
