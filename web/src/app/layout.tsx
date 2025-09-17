import './globals.css'
import { OverlayProvider } from 'overlay-kit'

import { AuthProvider } from '@/features/auth'

export const metadata = {
  title: 'Bonvivant Admin',
  description: 'Bonvivant 관리자 사이트',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <OverlayProvider>
          <AuthProvider>{children}</AuthProvider>
        </OverlayProvider>
      </body>
    </html>
  )
}
