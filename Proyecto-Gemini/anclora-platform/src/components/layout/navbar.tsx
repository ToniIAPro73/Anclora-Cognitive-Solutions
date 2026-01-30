'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'
import { LanguageToggle } from './language-toggle'
import { useLanguage } from './language-provider'

export function Navbar() {
  const { t } = useLanguage()

  return (
    <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex w-full justify-end items-center gap-x-4">
        <div className="relative w-64 hidden sm:block">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('nav.search')} 
            className="pl-8 bg-slate-100 dark:bg-zinc-900 border-none focus-visible:ring-teal-500" 
          />
        </div>
        <div className="flex items-center gap-x-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
        </Button>
        <div className="flex items-center gap-x-2 ml-2">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
            AD
          </div>
          <span className="text-sm font-semibold hidden lg:block">Admin</span>
        </div>
      </div>
    </div>
  )
}
