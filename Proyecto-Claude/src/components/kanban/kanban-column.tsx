'use client'

import { Droppable } from '@hello-pangea/dnd'
import { ProjectCard } from './project-card'
import { cn } from '@/lib/utils'
import type { ProjectWithClient } from '@/types/database.types'

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  projects: ProjectWithClient[]
}

export function KanbanColumn({ id, title, color, projects }: KanbanColumnProps) {
  return (
    <div className="kanban-column flex flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className={cn('h-3 w-3 rounded-full', color)} />
        <h3 className="font-semibold">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {projects.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 space-y-3 rounded-lg border-2 border-dashed p-3 min-h-[200px] transition-colors',
              snapshot.isDraggingOver
                ? 'border-primary bg-primary/5'
                : 'border-transparent bg-muted/30'
            )}
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                index={index}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
