'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Kanban,
  FileText,
  Receipt,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Clientes',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    name: 'Proyectos',
    href: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    name: 'Kanban',
    href: '/dashboard/kanban',
    icon: Kanban,
  },
  {
    name: 'Presupuestos',
    href: '/dashboard/quotes',
    icon: FileText,
  },
  {
    name: 'Facturas',
    href: '/dashboard/invoices',
    icon: Receipt,
  },
  {
    name: 'Alertas',
    href: '/dashboard/alerts',
    icon: Bell,
  },
  {
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border/50 bg-card/50 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          // Fix: Dashboard should only be active when exactly at /dashboard
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                'h-5 w-5 flex-shrink-0',
                isActive && 'text-primary-foreground'
              )} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-border bg-card shadow-sm hover:bg-secondary hover:border-accent/30 transition-all"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </aside>
  )
}
