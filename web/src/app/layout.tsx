import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}