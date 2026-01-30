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
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'kanban-card cursor-grab bg-card',
            snapshot.isDragging && 'kanban-card-dragging'
          )}
        >
          <CardHeader className="p-3 pb-2">
            <div className="flex items-start justify-between gap-2">
              <Badge
                variant="outline"
                className={cn('text-white border-0', PRIORITY_COLORS[project.priority])}
              >
                {PRIORITY_LABELS[project.priority]}
              </Badge>
              {(deadlineNear || deadlineOverdue) && (
                <AlertTriangle
                  className={cn(
                    'h-4 w-4',
                    deadlineOverdue ? 'text-red-500' : 'text-amber-500'
                  )}
                />
              )}
            </div>
            <h4 className="font-medium leading-tight mt-2" title={project.project_name}>
              {truncate(project.project_name, 50)}
            </h4>
          </CardHeader>

          <CardContent className="p-3 pt-0 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">
                  {getInitials(project.clients?.company_name || 'N/A')}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {project.clients?.company_name || 'Sin cliente'}
              </span>
            </div>

            {project.deadline && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span
                  className={cn(
                    deadlineOverdue && 'text-red-500 font-medium',
                    deadlineNear && !deadlineOverdue && 'text-amber-500 font-medium'
                  )}
                >
                  {formatDate(project.deadline)}
                </span>
              </div>
            )}

            {project.budget && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{formatCurrency(project.budget)}</span>
              </div>
            )}

            <Link
              href={`/dashboard/projects/${project.project_id}/edit`}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="h-3 w-3" />
              Ver detalles
            </Link>
          </CardContent>
        </Card>
      )}
    </Draggable>
  )
}
