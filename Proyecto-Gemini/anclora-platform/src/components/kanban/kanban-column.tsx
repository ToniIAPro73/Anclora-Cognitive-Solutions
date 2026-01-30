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
    <div className="flex flex-col w-[350px] shrink-0 bg-[#AFD2FA] dark:bg-[#192350] backdrop-blur-xl rounded-[2.5rem] p-5 border border-white/50 dark:border-white/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)] group/column transition-all duration-700 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden">
      {/* Sharp Top Edge Highlight */}
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-brand-gold/20" />
      
      <div className="flex items-center justify-between mb-8 px-5 relative z-10">
        <div className="flex flex-col">
          <h3 className="font-black text-[11px] text-slate-900 dark:text-foreground/70 uppercase tracking-[0.25em]">
            {title}
          </h3>
          <p className="text-[10px] text-muted-foreground/60 font-bold mt-1">
            {projects.length} {projects.length === 1 ? 'PROYECTO' : 'PROYECTOS'}
          </p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl group-hover/column:scale-110 transition-transform duration-500">
           <span className="text-primary font-black text-sm">{projects.length}</span>
        </div>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 min-h-[700px] transition-all duration-700 rounded-[2rem] p-2 space-y-6',
              snapshot.isDraggingOver ? 'bg-primary/5 ring-4 ring-primary/10 shadow-inner scale-[0.98]' : ''
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
            
            {projects.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted/20 rounded-[2rem] opacity-30">
                <p className="text-xs font-black uppercase tracking-widest">VACÍO</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
