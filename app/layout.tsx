import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { SessionProvider } from '@/components/session-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Asistencia Escolar',
  description:
    'Sistema de control de asistencia integrado con Google Classroom. Importa clases, pasa lista y genera reportes.',
}

export const viewport: Viewport = {
  themeColor: '#0d9488',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
