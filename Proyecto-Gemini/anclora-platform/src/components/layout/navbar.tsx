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
    <div className="flex items-center p-4 border-b border-border bg-background/95 dark:bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 shadow-sm">
      <div className="flex w-full justify-end items-center gap-x-4">
        <div className="relative w-64 hidden sm:block">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('nav.search')} 
            className="pl-8 bg-muted border-none focus-visible:ring-primary" 
          />
        </div>
        <div className="flex items-center gap-x-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
        </Button>
        <div className="flex items-center gap-x-2 ml-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs uppercase shadow-sm">
            AD
          </div>
          <span className="text-sm font-semibold hidden lg:block">Admin</span>
        </div>
      </div>
    </div>
  )
}
