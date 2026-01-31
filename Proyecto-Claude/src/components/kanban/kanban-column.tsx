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
    <div className="kanban-column flex flex-col animate-fade-in-up">
      {/* Column Header */}
      <div className="kanban-column-header mb-4 flex items-center justify-between rounded-xl bg-card border border-border/50 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-3 w-3 rounded-full ring-4 ring-offset-2 ring-offset-card transition-all duration-300',
            color
          )}
          style={{ boxShadow: `0 0 10px currentColor` }}
          />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <span className="flex items-center justify-center min-w-[28px] h-7 rounded-full bg-accent/10 px-2 text-sm font-medium text-accent transition-all duration-300 hover:bg-accent hover:text-accent-foreground">
          {projects.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 space-y-3 rounded-xl p-3 min-h-[200px] transition-all duration-300',
              'border-2 border-dashed',
              snapshot.isDraggingOver
                ? 'kanban-drop-zone-active border-accent/60 bg-accent/10 scale-[1.01]'
                : 'border-border/30 bg-muted/20 hover:bg-muted/30'
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
            {projects.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-24 text-muted-foreground/50">
                <p className="text-sm">Sin proyectos</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
