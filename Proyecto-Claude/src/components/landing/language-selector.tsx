'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useLocale } from '@/components/providers/locale-provider'
import { locales, localeNames, type Locale } from '@/lib/i18n/translations'
import { cn } from '@/lib/utils'

export function LanguageSelector() {
  const { locale, setLocale } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-full',
          'bg-secondary/50 hover:bg-secondary transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-accent/50',
          'border border-border/50 hover:border-accent/30',
          'text-sm font-medium'
        )}
        aria-label="Seleccionar idioma"
      >
        <Globe className="h-4 w-4 text-primary" />
        <span className="uppercase">{locale}</span>
        <ChevronDown className={cn(
          'h-3 w-3 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className={cn(
          'absolute right-0 mt-2 w-40 py-1',
          'bg-card border border-border rounded-xl shadow-lg',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}>
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc)
                setIsOpen(false)
              }}
              className={cn(
                'flex items-center justify-between w-full px-4 py-2',
                'text-sm hover:bg-secondary/50 transition-colors',
                locale === loc && 'text-accent font-medium'
              )}
            >
              <span>{localeNames[loc]}</span>
              {locale === loc && <Check className="h-4 w-4 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
