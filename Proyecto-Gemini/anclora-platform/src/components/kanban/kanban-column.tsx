'use client'

import { Droppable } from '@hello-pangea/dnd'
import { KanbanCard } from './kanban-card'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: string
  projects: any[]
  onCardClick: (project: any) => void
}

export function KanbanColumn({ id, title, projects, onCardClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-[320px] shrink-0 bg-muted/40 dark:bg-card/30 backdrop-blur-md rounded-2xl p-3 border border-border/50 shadow-inner">
      <div className="flex items-center justify-between mb-5 px-3">
        <h3 className="font-extrabold text-xs text-foreground/80 uppercase tracking-[0.2em] flex items-center">
          {title}
          <span className="ml-3 bg-primary/10 text-primary rounded-lg px-2 py-0.5 text-[10px] border border-primary/20 shadow-sm">
            {projects.length}
          </span>
        </h3>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 min-h-[500px] transition-all duration-300 rounded-xl p-2 space-y-4',
              snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-primary/20 ring-inset' : ''
            )}
          >
            {projects.map((project, index) => (
              <KanbanCard 
                key={project.project_id} 
                project={project} 
                index={index} 
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
