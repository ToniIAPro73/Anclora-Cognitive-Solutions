'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

interface KanbanCardProps {
  project: any
  index: number
  onClick: (project: any) => void
}

const priorityConfig: Record<string, { color: string, label: string }> = {
  low: { color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', label: 'Baja' },
  medium: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: 'Media' },
  high: { color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', label: 'Alta' },
  urgent: { color: 'text-red-500 bg-red-500/10 border-red-500/20', label: 'Urgente' },
}

export function KanbanCard({ project, index, onClick }: KanbanCardProps) {
  const config = priorityConfig[project.priority] || priorityConfig.low;

  return (
    <Draggable draggableId={project.project_id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group transition-all duration-200",
            snapshot.isDragging ? "scale-105 rotate-2 z-50" : "hover:-translate-y-1"
          )}
          onClick={() => onClick(project)}
        >
          <Card className={cn(
            "cursor-grab active:cursor-grabbing border-border/50 bg-card hover:border-primary/50 transition-all shadow-sm group-hover:shadow-md overflow-hidden relative",
            snapshot.isDragging && "shadow-2xl border-primary"
          )}>
            {/* Priority side indicator */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.color.split(' ')[0].replace('text', 'bg'))} />
            
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 uppercase font-bold tracking-wider rounded-md border', config.color)}>
                  {config.label}
                </Badge>
                <span className="text-[10px] font-bold text-primary/80 font-mono">
                  {formatCurrency(project.budget || 0)}
                </span>
              </div>
              <CardTitle className="text-sm font-bold leading-tight line-clamp-2 text-foreground/90">
                {project.project_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="flex items-center text-[11px] text-muted-foreground font-medium">
                <User className="h-3 w-3 mr-2 text-primary/60" />
                <span className="truncate">{project.clients?.company_name}</span>
              </div>
              {project.deadline && (
                <div className="flex items-center text-[10px] text-muted-foreground bg-muted/50 dark:bg-muted/20 px-2 py-1.5 rounded-lg border border-border/40">
                  <Calendar className="h-3 w-3 mr-2 text-primary/60" />
                  <span className="font-semibold">{formatDate(project.deadline)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
