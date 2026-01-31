'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, DollarSign, Eye, AlertTriangle } from 'lucide-react'
import { cn, formatDate, formatCurrency, isDeadlineNear, isDeadlineOverdue, getInitials, PRIORITY_LABELS, truncate } from '@/lib/utils'
import type { ProjectWithClient, ProjectPriority } from '@/types/database.types'
import Link from 'next/link'

interface ProjectCardProps {
  project: ProjectWithClient
  index: number
}

const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const deadlineNear = isDeadlineNear(project.deadline)
  const deadlineOverdue = isDeadlineOverdue(project.deadline)

  return (
    <Draggable draggableId={project.project_id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'kanban-card group',
            snapshot.isDragging && 'kanban-card-dragging'
          )}
          style={{
            ...provided.draggableProps.style,
            animationDelay: `${index * 50}ms`,
          }}
        >
          {/* Priority indicator bar */}
          <div className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-300',
            PRIORITY_COLORS[project.priority],
            'group-hover:w-1.5'
          )} />

          <div className="p-4 pl-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <Badge
                variant="outline"
                className={cn(
                  'text-white border-0 text-xs font-medium shadow-sm transition-transform duration-200',
                  PRIORITY_COLORS[project.priority],
                  'group-hover:scale-105'
                )}
              >
                {PRIORITY_LABELS[project.priority]}
              </Badge>
              {(deadlineNear || deadlineOverdue) && (
                <div className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full',
                  deadlineOverdue ? 'bg-red-500/10' : 'bg-amber-500/10',
                  deadlineOverdue ? 'pulse-glow' : ''
                )}>
                  <AlertTriangle
                    className={cn(
                      'h-4 w-4',
                      deadlineOverdue ? 'text-red-500' : 'text-amber-500'
                    )}
                  />
                </div>
              )}
            </div>

            {/* Title */}
            <h4
              className="font-semibold leading-tight text-foreground group-hover:text-accent transition-colors duration-200"
              title={project.project_name}
            >
              {truncate(project.project_name, 50)}
            </h4>

            {/* Content */}
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6 ring-2 ring-border/50 group-hover:ring-accent/30 transition-all">
                  <AvatarFallback className="text-[10px] bg-muted">
                    {getInitials(project.clients?.company_name || 'N/A')}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate font-medium">
                  {project.clients?.company_name || 'Sin cliente'}
                </span>
              </div>

              {project.deadline && (
                <div className="flex items-center gap-2.5 text-sm">
                  <div className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-md',
                    deadlineOverdue ? 'bg-red-500/10' : deadlineNear ? 'bg-amber-500/10' : 'bg-muted'
                  )}>
                    <Calendar className={cn(
                      'h-3.5 w-3.5',
                      deadlineOverdue ? 'text-red-500' : deadlineNear ? 'text-amber-500' : 'text-muted-foreground'
                    )} />
                  </div>
                  <span
                    className={cn(
                      'font-medium',
                      deadlineOverdue && 'text-red-500',
                      deadlineNear && !deadlineOverdue && 'text-amber-500'
                    )}
                  >
                    {formatDate(project.deadline)}
                  </span>
                </div>
              )}

              {project.budget && (
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-accent/10">
                    <DollarSign className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <span className="font-semibold text-foreground">{formatCurrency(project.budget)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-border/50">
              <Link
                href={`/dashboard/projects/${project.project_id}/edit`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors group/link"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="h-3.5 w-3.5 transition-transform group-hover/link:scale-110" />
                <span className="group-hover/link:underline">Ver detalles</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
