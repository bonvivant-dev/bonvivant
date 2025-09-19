import './globals.css'
import { OverlayProvider } from 'overlay-kit'

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
        <OverlayProvider>{children}</OverlayProvider>
      </body>
    </html>
  )
}
