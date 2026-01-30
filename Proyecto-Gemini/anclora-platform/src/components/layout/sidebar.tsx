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
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { useLanguage } from './language-provider'
import { useSidebar } from './sidebar-provider'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { isCollapsed, toggle } = useSidebar()

  const routes = [
    {
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
      color: 'text-sky-500',
    },
    {
      label: t('nav.clients'),
      icon: Users,
      href: '/clients',
      color: 'text-violet-500',
    },
    {
      label: t('nav.projects'),
      icon: Briefcase,
      href: '/projects',
      color: 'text-pink-700',
    },
    {
      label: t('nav.kanban'),
      icon: KanbanSquare,
      href: '/kanban',
      color: 'text-orange-700',
    },
    {
      label: t('nav.quotes'),
      icon: FileText,
      href: '/quotes',
      color: 'text-emerald-500',
    },
    {
      label: t('nav.invoices'),
      icon: CreditCard,
      href: '/invoices',
      color: 'text-blue-700',
    },
    {
      label: t('nav.alerts'),
      icon: Bell,
      href: '/alerts',
      color: 'text-red-500',
    },
  ]

  return (
    <div className={cn(
      "relative space-y-4 py-4 flex flex-col h-full bg-zinc-950 dark:bg-black text-white transition-all duration-300",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* modern Toggle Button */}
      <Button
        onClick={toggle}
        className={cn(
          "absolute -right-3 top-10 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-teal-500 hover:bg-teal-600 border border-slate-200 dark:border-slate-800 shadow-lg z-[90] transition-all",
          isCollapsed ? "rotate-0" : "rotate-0"
        )}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4 text-white" /> : <ChevronLeft className="h-4 w-4 text-white" />}
      </Button>

      <div className="px-3 py-2 flex-1 overflow-y-auto overflow-x-hidden">
        <Link href="/dashboard" className={cn(
          "flex items-center transition-all",
          isCollapsed ? "justify-center" : "pl-3 mb-10"
        )}>
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="w-full h-full bg-teal-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(20,184,166,0.3)] text-white">A</div>
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold ml-4 tracking-tight">Anclora</h1>
          )}
        </Link>
        <div className="space-y-1 mt-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-colors',
                pathname === route.href ? 'text-white bg-white/10' : 'text-zinc-400',
                isCollapsed ? "justify-center" : "justify-start"
              )}
              title={isCollapsed ? route.label : ''}
            >
              <div className="flex items-center">
                <route.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3', route.color)} />
                {!isCollapsed && <span>{route.label}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-slate-800">
        <button
          onClick={() => signOut()}
          className={cn(
            "text-sm group flex p-3 w-full font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          title={isCollapsed ? t('nav.logout') : ''}
        >
          <div className="flex items-center">
            <LogOut className={cn("h-5 w-5 text-red-400", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{t('nav.logout')}</span>}
          </div>
        </button>
      </div>
    </div>
  )
}
