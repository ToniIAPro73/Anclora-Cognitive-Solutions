'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'system' | 'dark'

const themes: Theme[] = ['light', 'system', 'dark']

const themeLabels: Record<Theme, string> = {
  light: 'Modo claro',
  system: 'Tema del sistema',
  dark: 'Modo oscuro',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={cn(
        'flex h-9 items-center gap-1 rounded-full p-1',
        'bg-secondary/50 transition-all duration-300',
        'border border-border/50'
      )}
      role="radiogroup"
      aria-label="Seleccionar tema"
    >
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={cn(
            'relative flex h-7 w-7 items-center justify-center rounded-full',
            'transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            theme === t
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
          )}
          role="radio"
          aria-checked={theme === t}
          aria-label={themeLabels[t]}
        >
          {t === 'light' && <Sun className="h-4 w-4" />}
          {t === 'system' && <Monitor className="h-4 w-4" />}
          {t === 'dark' && <Moon className="h-4 w-4" />}
        </button>
      ))}
    </div>
  )
}
