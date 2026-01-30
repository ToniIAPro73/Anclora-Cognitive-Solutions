'use client'

import * as React from 'react'
import { useLanguage } from './language-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

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
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => setLanguage(lang.value as any)}
            className={language === lang.value ? 'bg-slate-100 dark:bg-slate-800' : ''}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
