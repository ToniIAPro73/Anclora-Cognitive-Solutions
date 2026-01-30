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
    <div className="flex flex-col w-[300px] shrink-0 bg-slate-50/50 rounded-lg p-2">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider flex items-center">
          {title}
          <span className="ml-2 bg-slate-200 text-slate-600 rounded-full px-2 py-0.5 text-[10px]">
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
              'flex-1 min-h-[500px] transition-colors rounded-md p-1',
              snapshot.isDraggingOver ? 'bg-teal-50/50' : ''
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
