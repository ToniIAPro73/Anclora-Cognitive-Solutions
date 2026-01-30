'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Edit2, Trash2, FolderArchive, Calendar } from 'lucide-react'
import { ProjectFormModal } from '@/components/projects/project-form-modal'
import { deleteProjectAction, archiveProjectAction } from '@/app/actions/projects'
import { toast } from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

const statusMap: Record<string, { label: string, color: string }> = {
  backlog: { label: 'Backlog', color: 'bg-slate-500/10 text-slate-500' },
  proposal: { label: 'Presupuesto', color: 'bg-sky-500/10 text-sky-500' },
  approved: { label: 'Aprobado', color: 'bg-indigo-500/10 text-indigo-500' },
  in_progress: { label: 'En curso', color: 'bg-orange-500/10 text-orange-500' },
  testing: { label: 'Testing', color: 'bg-purple-500/10 text-purple-500' },
  completed: { label: 'Completado', color: 'bg-emerald-500/10 text-emerald-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500' },
} as const;

const priorityMap: Record<string, string> = {
  low: 'bg-slate-100 text-slate-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, clients(company_name)')
      .eq('archived', false)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error al cargar proyectos')
    } else {
      setProjects(data || [])
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      const result = await deleteProjectAction(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Proyecto eliminado')
        fetchProjects()
      }
    }
  }

  const handleArchive = async (id: string) => {
    const result = await archiveProjectAction(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Proyecto archivado')
      fetchProjects()
    }
  }

  const filteredProjects = projects.filter(project => 
    project.project_name.toLowerCase().includes(search.toLowerCase()) ||
    project.clients?.company_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground">Listado general de proyectos y su progreso actual.</p>
        </div>
        <Button 
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => {
            setEditingProject(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="flex items-center gap-x-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por proyecto o cliente..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Presupuesto</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No se encontraron proyectos.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.project_id}>
                  <TableCell className="font-medium">{project.project_name}</TableCell>
                  <TableCell>{project.clients?.company_name}</TableCell>
                  <TableCell>
                    <Badge className={cn('font-normal', statusMap[project.status]?.color)}>
                      {statusMap[project.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('font-normal capitalize', priorityMap[project.priority])}>
                      {project.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(project.budget || 0)}</TableCell>
                  <TableCell>
                    {project.deadline ? (
                      <div className="flex items-center text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(project.deadline)}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-x-2">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Editar"
                        onClick={() => {
                          setEditingProject(project)
                          setIsModalOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4 text-sky-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Archivar"
                        onClick={() => handleArchive(project.project_id)}
                      >
                        <FolderArchive className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Eliminar"
                        onClick={() => handleDelete(project.project_id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
