import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('flex-1 overflow-auto p-6 page-transition', className)}>
      <div className="mx-auto max-w-7xl animate-fade-in-up">{children}</div>
    </div>
  )
}

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  backHref?: string
}

export function PageHeader({ title, description, actions, backHref }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="group mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver</span>
          </Link>
        )}
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2 animate-fade-in">{actions}</div>}
    </div>
  )
}
