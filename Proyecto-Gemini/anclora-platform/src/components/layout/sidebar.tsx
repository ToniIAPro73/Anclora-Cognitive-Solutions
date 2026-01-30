'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  KanbanSquare,
  FileText,
  CreditCard,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Clientes',
    icon: Users,
    href: '/clients',
    color: 'text-violet-500',
  },
  {
    label: 'Proyectos',
    icon: Briefcase,
    href: '/projects',
    color: 'text-pink-700',
  },
  {
    label: 'Kanban',
    icon: KanbanSquare,
    href: '/kanban',
    color: 'text-orange-700',
  },
  {
    label: 'Presupuestos',
    icon: FileText,
    href: '/quotes',
    color: 'text-emerald-500',
  },
  {
    label: 'Facturas',
    icon: CreditCard,
    href: '/invoices',
    color: 'text-blue-700',
  },
  {
    label: 'Alertas',
    icon: Bell,
    href: '/alerts',
    color: 'text-red-500',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <div className="w-full h-full bg-teal-500 rounded-lg flex items-center justify-center font-bold text-xl">A</div>
          </div>
          <h1 className="text-xl font-bold">Anclora</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition',
                pathname === route.href ? 'text-white bg-white/10' : 'text-zinc-400'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <button
          onClick={() => signOut()}
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
        >
          <div className="flex items-center flex-1">
            <LogOut className="h-5 w-5 mr-3 text-red-400" />
            Cerrar Sesión
          </div>
        </button>
      </div>
    </div>
  )
}
