'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Client } from '@/types/database.types'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Kanban,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

interface PortalLayoutProps {
  children: React.ReactNode
  params: { clientId: string }
}

export default function PortalLayout({ children, params }: PortalLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function loadClient() {
      const supabase = createClient()

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/portal/login')
        return
      }

      // Load client data
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('client_id', params.clientId)
        .single()

      if (!clientData) {
        router.push('/portal/login')
        return
      }

      setClient(clientData)
      setIsLoading(false)
    }

    loadClient()
  }, [params.clientId, router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/portal/login')
  }

  const navItems = [
    {
      href: `/portal/client/${params.clientId}`,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: `/portal/client/${params.clientId}/quotes`,
      label: 'Presupuestos',
      icon: FileText,
    },
    {
      href: `/portal/client/${params.clientId}/invoices`,
      label: 'Facturas',
      icon: Receipt,
    },
    {
      href: `/portal/client/${params.clientId}/kanban`,
      label: 'Proyectos',
      icon: Kanban,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-4">
            <Link
              href={`/portal/client/${params.clientId}`}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                A
              </div>
              <span className="hidden font-semibold sm:block">
                Anclora
              </span>
            </Link>
            <span className="hidden text-muted-foreground md:block">|</span>
            <span className="hidden text-sm text-muted-foreground md:block">
              {client?.company_name}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t bg-white p-4 md:hidden">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Anclora Cognitive Solutions. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
