'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { createClient } from '@/lib/supabase/client'
import { KanbanColumn } from '@/components/kanban/kanban-column'
import { ProjectFormModal } from '@/components/projects/project-form-modal'
import { updateProjectAction } from '@/app/actions/projects'
import { toast } from 'react-hot-toast'
import { isTransitionAllowed } from '@/lib/validations/project.schema'

const COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'proposal', title: 'Presupuesto' },
  { id: 'approved', title: 'Aprobado' },
  { id: 'in_progress', title: 'En curso' },
  { id: 'testing', title: 'Testing' },
  { id: 'completed', title: 'Completado' },
  { id: 'cancelled', title: 'Cancelado' },
]

export default function KanbanPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const supabase = createClient()

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, clients(company_name)')
      .eq('archived', false)

    if (error) {
      toast.error('Error al cargar proyectos')
    } else {
      setProjects(data || [])
    }
  }, [supabase])

  useEffect(() => {
    fetchProjects()

    // Realtime subscription
    const channel = supabase
      .channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchProjects])

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const project = projects.find(p => p.project_id === draggableId)
    if (!project) return

    const fromStatus = source.droppableId
    const toStatus = destination.droppableId

    if (!isTransitionAllowed(fromStatus, toStatus)) {
      toast.error(`Transición no permitida: ${fromStatus} -> ${toStatus}`)
      return
    }

    // Optimistic update
    const updatedProjects = projects.map(p => 
      p.project_id === draggableId ? { ...p, status: toStatus } : p
    )
    setProjects(updatedProjects)

    // Backend update
    const updateResult = await updateProjectAction(draggableId, {
      ...project,
      status: toStatus
    })

    if (updateResult.error) {
      toast.error(updateResult.error)
      fetchProjects() // Rollback
    }
  }

  const getColumnProjects = (status: string) => {
    return projects.filter(p => p.status === status)
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tablero Kanban</h1>
        <p className="text-muted-foreground">Gestiona el flujo de trabajo de forma visual y en tiempo real.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-x-6 h-full min-w-max">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                projects={getColumnProjects(column.id)}
                onCardClick={(p) => {
                  setEditingProject(p)
                  setIsModalOpen(true)
                }}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          fetchProjects()
        }}
        initialData={editingProject}
      />
    </div>
  )
}
