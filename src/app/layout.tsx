import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JuneTech 2026 — Card Generator',
  description: 'Génère ta card JuneTech 2026',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
