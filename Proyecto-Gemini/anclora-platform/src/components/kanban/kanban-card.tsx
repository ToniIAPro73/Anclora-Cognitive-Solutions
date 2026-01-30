'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, ArrowRight, Layers } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

interface KanbanCardProps {
  project: any
  index: number
  onClick: (project: any) => void
}

const priorityConfig: Record<string, { color: string, label: string, shadow: string, glow: string }> = {
  low: { 
    color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', 
    label: 'Baja',
    shadow: 'hover:shadow-[0_20px_40px_rgba(100,116,139,0.15)]',
    glow: 'group-hover:bg-slate-500/5'
  },
  medium: { 
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', 
    label: 'Media',
    shadow: 'hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)]',
    glow: 'group-hover:bg-blue-500/5'
  },
  high: { 
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', 
    label: 'Alta',
    shadow: 'hover:shadow-[0_20px_40px_rgba(249,115,22,0.15)]',
    glow: 'group-hover:bg-orange-500/5'
  },
  urgent: { 
    color: 'text-red-500 bg-red-500/10 border-red-500/20', 
    label: 'Urgente',
    shadow: 'hover:shadow-[0_20px_40px_rgba(239,68,68,0.15)]',
    glow: 'group-hover:bg-red-500/5'
  },
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
            "group transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
            snapshot.isDragging ? "scale-[1.12] rotate-[2.5deg] z-[100]" : "hover:-translate-y-4"
          )}
          onClick={() => onClick(project)}
        >
          <Card className={cn(
            "cursor-grab active:cursor-grabbing border-white/10 dark:border-white/5 bg-card/80 backdrop-blur-md transition-all duration-700 rounded-[2rem] overflow-hidden relative shadow-md hover:border-primary/50",
            config.shadow,
            snapshot.isDragging ? "shadow-[0_30px_70px_rgba(0,0,0,0.4)] border-primary/60" : "shadow-xl shadow-black/5"
          )}>
            {/* Soft Interior Glow */}
            <div className={cn("absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100", config.glow)} />
            
            {/* Priority side indicator with dynamic gradient */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-2 transition-all duration-700 group-hover:w-3",
              config.color.split(' ')[0].replace('text', 'bg'),
              "opacity-80"
            )} />
            
            <CardHeader className="p-6 pb-4 relative z-10">
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className={cn('text-[9px] px-3 py-0.5 uppercase font-black tracking-[0.2em] rounded-full border-2', config.color)}>
                  {config.label}
                </Badge>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
                  <span className="text-[12px] font-black text-primary font-mono tracking-tighter">
                    {formatCurrency(project.budget || 0)}
                  </span>
                </div>
              </div>
              <CardTitle className="text-lg font-black leading-tight line-clamp-2 text-foreground/90 group-hover:text-primary transition-all duration-500 group-hover:tracking-tight">
                {project.project_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-5 relative z-10">
              <div className="flex items-center text-[13px] text-muted-foreground/70 font-bold group-hover:text-foreground/90 transition-colors duration-500">
                <div className="p-2 bg-muted/50 rounded-xl mr-4 group-hover:bg-primary/20 group-hover:text-primary group-hover:rotate-[360deg] transition-all duration-1000 shadow-inner">
                  <User className="h-4 w-4" />
                </div>
                <span className="truncate">{project.clients?.company_name}</span>
              </div>
              
              {project.deadline && (
                <div className="flex items-center justify-between group-hover:justify-start gap-4 text-[11px] text-muted-foreground/80 bg-white/5 dark:bg-black/20 px-5 py-3 rounded-2xl border border-white/5 shadow-inner transition-all duration-500 overflow-hidden relative">
                  <div className="flex items-center relative z-10">
                    <Calendar className="h-4 w-4 mr-3 text-primary/70 group-hover:scale-125 transition-transform duration-500" />
                    <span className="font-black tracking-wide">{formatDate(project.deadline)}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0 transition-all duration-500 relative z-10" />
                  
                  {/* Subtle Background Decoration */}
                  <Layers className="absolute -right-2 -bottom-2 h-12 w-12 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
