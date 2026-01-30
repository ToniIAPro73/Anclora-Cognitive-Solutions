'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
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
  const [search, setSearch] = useState('')
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
    return projects.filter(p => 
      p.status === status &&
      (p.project_name.toLowerCase().includes(search.toLowerCase()) ||
       p.clients?.company_name.toLowerCase().includes(search.toLowerCase()))
    )
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#192350] dark:text-white">Tablero Kanban</h1>
          <p className="text-muted-foreground mt-1 font-medium">Gestiona el flujo de trabajo de forma visual y en tiempo real.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          onClick={() => {
            setEditingProject(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <Card className="border-none shadow-none bg-muted/40 p-2 rounded-2xl">
        <CardContent className="p-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por proyecto o cliente..." 
              className="pl-11 bg-background border-border/50 h-12 rounded-xl focus-visible:ring-primary shadow-sm text-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="h-[calc(100vh-280px)] overflow-x-auto pb-4 custom-scrollbar">
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
