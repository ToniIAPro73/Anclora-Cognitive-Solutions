'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/layout/empty-state'
import { getProjects, archiveProject, deleteProject } from '@/app/actions/projects'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import {
  cn,
  formatDate,
  formatCurrency,
  STATUS_LABELS,
  PRIORITY_LABELS,
  isDeadlineNear,
  isDeadlineOverdue,
} from '@/lib/utils'
import type { ProjectStatus, ProjectPriority } from '@/types/database.types'
import {
  Search,
  MoreHorizontal,
  Edit,
  Archive,
  Trash2,
  FolderKanban,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<ProjectStatus, string> = {
  backlog: 'bg-slate-500',
  proposal: 'bg-amber-500',
  approved: 'bg-emerald-500',
  in_progress: 'bg-blue-500',
  testing: 'bg-purple-500',
  completed: 'bg-green-600',
  cancelled: 'bg-red-500',
}

const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
}

export function ProjectsTable() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
  }, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search, statusFilter, priorityFilter],
    queryFn: async () => {
      const result = await getProjects({
        search: search || undefined,
        status: statusFilter !== 'all' ? (statusFilter as ProjectStatus) : undefined,
        priority: priorityFilter !== 'all' ? (priorityFilter as ProjectPriority) : undefined,
        archived: false,
      })
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
  })

  const archiveMutation = useMutation({
    mutationFn: archiveProject,
    onSuccess: () => {
      toast.success('Proyecto archivado')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success('Proyecto eliminado')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setDeleteDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = () => {
    if (selectedProjectId) {
      deleteMutation.mutate(selectedProjectId)
    }
  }

  const projects = data || []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            className="pl-10"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Cargando...</div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No hay proyectos"
          description="Crea tu primer proyecto para empezar"
          actionLabel="Nuevo Proyecto"
          actionHref="/dashboard/projects/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Fecha límite</TableHead>
                <TableHead>Presupuesto</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const deadlineNear = isDeadlineNear(project.deadline)
                const deadlineOverdue = isDeadlineOverdue(project.deadline)
                const client = project.clients as { company_name: string; email: string } | null

                return (
                  <TableRow key={project.project_id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/projects/${project.project_id}/edit`}
                        className="hover:underline"
                      >
                        {project.project_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client?.company_name || 'Sin cliente'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('text-white border-0', STATUS_COLORS[project.status as ProjectStatus])}
                      >
                        {STATUS_LABELS[project.status as ProjectStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('text-white border-0', PRIORITY_COLORS[project.priority as ProjectPriority])}
                      >
                        {PRIORITY_LABELS[project.priority as ProjectPriority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {project.deadline ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span
                            className={cn(
                              deadlineOverdue && 'text-red-500 font-medium',
                              deadlineNear && !deadlineOverdue && 'text-amber-500 font-medium'
                            )}
                          >
                            {formatDate(project.deadline)}
                          </span>
                          {(deadlineNear || deadlineOverdue) && (
                            <AlertTriangle
                              className={cn(
                                'h-4 w-4',
                                deadlineOverdue ? 'text-red-500' : 'text-amber-500'
                              )}
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {project.budget ? formatCurrency(project.budget) : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/projects/${project.project_id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => archiveMutation.mutate(project.project_id)}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archivar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedProjectId(project.project_id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al proyecto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
