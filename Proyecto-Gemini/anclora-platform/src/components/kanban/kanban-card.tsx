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

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
}

export function KanbanCard({ project, index, onClick }: KanbanCardProps) {
  return (
    <Draggable draggableId={project.project_id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3"
          onClick={() => onClick(project)}
        >
          <Card className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-l-4" 
                style={{ borderLeftColor: priorityColors[project.priority] || '#cbd5e1' }}>
            <CardHeader className="p-3 pb-0">
              <div className="flex justify-between items-start">
                <Badge className={cn('text-[10px] px-1 py-0 uppercase', priorityColors[project.priority])}>
                  {project.priority}
                </Badge>
                <span className="text-[10px] font-bold text-teal-600">
                  {formatCurrency(project.budget || 0)}
                </span>
              </div>
              <CardTitle className="text-sm font-bold mt-2 line-clamp-2">
                {project.project_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-2 space-y-2">
              <div className="flex items-center text-[11px] text-muted-foreground">
                <User className="h-3 w-3 mr-1" />
                <span className="truncate">{project.clients?.company_name}</span>
              </div>
              {project.deadline && (
                <div className="flex items-center text-[10px] text-muted-foreground bg-slate-50 p-1 rounded">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(project.deadline)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
