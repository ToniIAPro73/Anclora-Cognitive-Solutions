'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import type { ProjectWithClient, ProjectStatus } from '@/types/database.types'
import { Clock, AlertTriangle, FolderKanban } from 'lucide-react'

interface ClientKanbanPageProps {
  params: { clientId: string }
}

const COLUMNS: { status: ProjectStatus; label: string; color: string }[] = [
  { status: 'proposal', label: 'Propuesta', color: 'border-amber-500' },
  { status: 'approved', label: 'Aprobado', color: 'border-blue-500' },
  { status: 'in_progress', label: 'En progreso', color: 'border-indigo-500' },
  { status: 'testing', label: 'En revisión', color: 'border-purple-500' },
  { status: 'completed', label: 'Completado', color: 'border-green-500' },
]

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export default function ClientKanbanPage({ params }: ClientKanbanPageProps) {
  const [projects, setProjects] = useState<ProjectWithClient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient()

      const { data } = await supabase
        .from('projects')
        .select('*, clients(*)')
        .eq('client_id', params.clientId)
        .eq('archived', false)
        .neq('status', 'backlog')
        .neq('status', 'cancelled')
        .order('priority', { ascending: false })
        .order('deadline', { ascending: true })

      setProjects((data || []) as ProjectWithClient[])
      setIsLoading(false)
    }

    loadProjects()
  }, [params.clientId])

  const getProjectsByStatus = (status: ProjectStatus) =>
    projects.filter(p => p.status === status)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estado de proyectos</h1>
        <p className="text-muted-foreground">
          Visualiza el progreso de tus proyectos
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No hay proyectos</h3>
            <p className="text-muted-foreground text-sm">
              Aún no tienes proyectos activos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => {
            const columnProjects = getProjectsByStatus(column.status)

            return (
              <div
                key={column.status}
                className="flex-shrink-0 w-72"
              >
                <div className={cn(
                  "rounded-lg border-t-4 bg-muted/30",
                  column.color
                )}>
                  {/* Column Header */}
                  <div className="p-3 border-b bg-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{column.label}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {columnProjects.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="p-2 min-h-[400px] space-y-2">
                    {columnProjects.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Sin proyectos
                      </p>
                    ) : (
                      columnProjects.map((project) => {
                        const isDeadlineSoon = project.deadline &&
                          new Date(project.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

                        return (
                          <Card
                            key={project.project_id}
                            className="cursor-default hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-3">
                              {/* Priority Badge */}
                              <div className="flex items-center justify-between mb-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs border-0',
                                    PRIORITY_COLORS[project.priority]
                                  )}
                                >
                                  {PRIORITY_LABELS[project.priority]}
                                </Badge>
                              </div>

                              {/* Project Name */}
                              <h4 className="font-medium text-sm line-clamp-2 mb-2">
                                {project.project_name}
                              </h4>

                              {/* Project Details */}
                              <div className="space-y-1.5 text-xs text-muted-foreground">
                                {/* Deadline */}
                                {project.deadline && (
                                  <div className={cn(
                                    'flex items-center gap-1',
                                    isDeadlineSoon && 'text-red-600'
                                  )}>
                                    {isDeadlineSoon ? (
                                      <AlertTriangle className="h-3 w-3" />
                                    ) : (
                                      <Clock className="h-3 w-3" />
                                    )}
                                    <span>{formatDate(project.deadline)}</span>
                                  </div>
                                )}

                                {/* Budget */}
                                {project.budget && (
                                  <div className="flex items-center justify-between">
                                    <span>Presupuesto:</span>
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(project.budget)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leyenda de estados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            {COLUMNS.map((col) => (
              <div key={col.status} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded', col.color.replace('border-', 'bg-'))} />
                <span>{col.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
