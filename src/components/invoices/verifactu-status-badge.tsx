'use client'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { VerifactuStatus } from '@/types/database.types'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileX,
} from 'lucide-react'

interface VerifactuStatusBadgeProps {
  status: VerifactuStatus
  errorMessage?: string | null
  className?: string
}

const STATUS_CONFIG: Record<
  VerifactuStatus,
  {
    label: string
    variant: string
    icon: typeof CheckCircle2
  }
> = {
  not_registered: {
    label: 'Sin registrar',
    variant: 'bg-slate-400 text-white',
    icon: FileX,
  },
  pending: {
    label: 'Pendiente',
    variant: 'bg-amber-500 text-white',
    icon: Clock,
  },
  registered: {
    label: 'Registrada',
    variant: 'bg-emerald-500 text-white',
    icon: CheckCircle2,
  },
  error: {
    label: 'Error',
    variant: 'bg-red-500 text-white',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Anulada',
    variant: 'bg-gray-500 text-white',
    icon: XCircle,
  },
}

export function VerifactuStatusBadge({
  status,
  errorMessage,
  className,
}: VerifactuStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'border-0 gap-1.5',
        config.variant,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )

  // Show tooltip with error message if status is error
  if (status === 'error' && errorMessage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">{badge}</span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs bg-red-50 text-red-800 border-red-200"
          >
            <p className="text-sm">{errorMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badge
}
