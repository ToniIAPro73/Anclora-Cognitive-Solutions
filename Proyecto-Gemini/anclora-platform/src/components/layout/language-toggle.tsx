'use client'

import * as React from 'react'
import { useLanguage } from './language-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="gap-2">
        <Languages className="h-4 w-4" />
        <span className="uppercase text-xs font-bold">{language}</span>
      </Button>
    )
  }

  const languages = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'Deutsch', value: 'de' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="uppercase text-xs font-bold">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl p-1.5 min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => setLanguage(lang.value as any)}
            className={cn(
              "rounded-xl transition-all duration-300",
              language === lang.value 
                ? 'bg-primary/20 text-primary font-bold shadow-sm' 
                : 'hover:bg-primary/5'
            )}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
