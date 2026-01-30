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
import { Plus, Search, Edit2, Trash2, FolderArchive, Calendar, Briefcase } from 'lucide-react'
import { ProjectFormModal } from '@/components/projects/project-form-modal'
import { deleteProjectAction, archiveProjectAction } from '@/app/actions/projects'
import { toast } from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

const statusMap: Record<string, { label: string, color: string }> = {
  backlog: { label: 'Backlog', color: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20' },
  proposal: { label: 'Presupuesto', color: 'bg-sky-500/10 text-sky-500 dark:text-sky-400 border-sky-500/20' },
  approved: { label: 'Aprobado', color: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20' },
  in_progress: { label: 'En curso', color: 'bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20' },
  testing: { label: 'Testing', color: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20' },
  completed: { label: 'Completado', color: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20' },
} as const;

const priorityMap: Record<string, string> = {
  low: 'bg-slate-500/5 text-slate-600 dark:text-slate-400 border-slate-500/10',
  medium: 'bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10',
  high: 'bg-orange-500/5 text-orange-600 dark:text-orange-400 border-orange-500/10',
  urgent: 'bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/10',
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
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground mt-1">Gestión integral del ciclo de vida de tus proyectos de IA.</p>
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

      <Card className="border-none shadow-none bg-muted/30 p-2 rounded-2xl">
        <CardContent className="p-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por proyecto o cliente..." 
              className="pl-11 bg-background border-border/50 h-12 rounded-xl focus-visible:ring-primary shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="py-5 px-6 font-bold text-foreground">Proyecto</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground">Cliente</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground text-center">Estado</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground text-center">Prioridad</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground">Presupuesto</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground">Entrega</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Briefcase className="h-10 w-10 opacity-20" />
                    <p>No se encontraron proyectos.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.project_id} className="hover:bg-muted/30 border-border/40 transition-colors">
                  <TableCell className="py-4 px-6 font-semibold text-foreground">
                    {project.project_name}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-muted-foreground font-medium">
                    {project.clients?.company_name}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    <Badge className={cn('font-bold text-[10px] tracking-wider uppercase border', statusMap[project.status]?.color)}>
                      {statusMap[project.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    <Badge variant="outline" className={cn('font-bold text-[10px] tracking-wider uppercase border', priorityMap[project.priority])}>
                      {project.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 font-mono text-sm">
                    {formatCurrency(project.budget || 0)}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {project.deadline ? (
                      <div className="flex items-center text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-2 text-primary" />
                        {formatDate(project.deadline)}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-x-1">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 shadow-sm"
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
                        className="h-9 w-9 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-500/10 shadow-sm"
                        title="Archivar"
                        onClick={() => handleArchive(project.project_id)}
                      >
                        <FolderArchive className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg hover:bg-destructive/5 shadow-sm"
                        title="Eliminar"
                        onClick={() => handleDelete(project.project_id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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
