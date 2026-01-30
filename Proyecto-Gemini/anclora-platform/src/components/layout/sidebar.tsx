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
      "relative space-y-4 py-6 flex flex-col h-full bg-white dark:bg-black border-r border-border/60 text-foreground transition-all duration-300 ease-in-out shadow-sm",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* modern Toggle Button */}
      <Button
        onClick={toggle}
        className={cn(
          "absolute -right-3 top-10 h-7 w-7 rounded-full p-0 flex items-center justify-center bg-primary hover:bg-primary/90 border border-border shadow-xl z-[90] transition-all",
          isCollapsed ? "rotate-0" : "rotate-0"
        )}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4 text-primary-foreground" /> : <ChevronLeft className="h-4 w-4 text-primary-foreground" />}
      </Button>

      <div className="px-6 py-2 flex-1 overflow-y-auto overflow-x-hidden">
        <Link href="/dashboard" className={cn(
          "flex items-center transition-all mb-10",
          isCollapsed ? "justify-center" : "pl-1"
        )}>
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="w-full h-full bg-primary rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/20 text-primary-foreground">A</div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col ml-3 overflow-hidden">
              <span className="text-xl font-bold tracking-tight text-foreground truncate">Anclora</span>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Solutions</span>
            </div>
          )}
        </Link>
        <div className="space-y-2 mt-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-semibold cursor-pointer rounded-xl transition-all duration-200',
                pathname === route.href 
                  ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(20,184,166,0.1)]' 
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                isCollapsed ? "justify-center p-3" : "justify-start"
              )}
              title={isCollapsed ? route.label : ''}
            >
              <div className="flex items-center">
                <route.icon className={cn('h-5 w-5 transition-transform group-hover:scale-110 duration-200', !isCollapsed && 'mr-4', route.color)} />
                {!isCollapsed && <span>{route.label}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-t border-border/50">
        <button
          onClick={() => signOut()}
          className={cn(
            "text-sm group flex p-4 w-full font-semibold cursor-pointer rounded-xl transition-all text-muted-foreground hover:bg-destructive/5 hover:text-destructive",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          title={isCollapsed ? t('nav.logout') : ''}
        >
          <div className="flex items-center">
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-4")} />
            {!isCollapsed && <span>{t('nav.logout')}</span>}
          </div>
        </button>
      </div>
    </div>
  )
}
