import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { LocaleProvider } from '@/components/providers/locale-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anclora Cognitive Solutions',
  description: 'Plataforma SaaS para consultorías de IA',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LocaleProvider>
            <QueryProvider>
              {children}
              <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(142 76% 36%)',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(0 84% 60%)',
                  secondary: 'white',
                },
              },
            }}
          />
            </QueryProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
