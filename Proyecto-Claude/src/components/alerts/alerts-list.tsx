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
import {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  resolveAlert,
  deleteAlert,
  type AlertWithRelations,
  type AlertFilterParams,
} from '@/app/actions/alerts'
import { cn, formatDate } from '@/lib/utils'
import type { AlertType, AlertPriority } from '@/types/database.types'
import {
  Bell,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Trash2,
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign,
  FileWarning,
  UserX,
  CheckCheck,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'

const TYPE_LABELS: Record<AlertType, string> = {
  deadline_approaching: 'Fecha límite cercana',
  budget_exceeded: 'Presupuesto excedido',
  invoice_overdue: 'Factura vencida',
  project_stale: 'Proyecto estancado',
  client_inactive: 'Cliente inactivo',
}

const TYPE_ICONS: Record<AlertType, React.ElementType> = {
  deadline_approaching: Calendar,
  budget_exceeded: DollarSign,
  invoice_overdue: FileWarning,
  project_stale: Clock,
  client_inactive: UserX,
}

const PRIORITY_LABELS: Record<AlertPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

const PRIORITY_COLORS: Record<AlertPriority, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
}

export function AlertsList() {
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)

  const filters: AlertFilterParams = {
    type: typeFilter as AlertType | 'all',
    priority: priorityFilter as AlertPriority | 'all',
    status: statusFilter as 'active' | 'resolved' | 'all',
  }

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const result = await getAlerts(filters)
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
  })

  const markReadMutation = useMutation({
    mutationFn: markAlertAsRead,
    onSuccess: () => {
      toast.success('Alerta marcada como leída')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllAlertsAsRead,
    onSuccess: () => {
      toast.success('Todas las alertas marcadas como leídas')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const resolveMutation = useMutation({
    mutationFn: resolveAlert,
    onSuccess: () => {
      toast.success('Alerta resuelta')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      toast.success('Alerta eliminada')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      setDeleteDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const generateAlertsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cron/generate-alerts', { method: 'POST' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al generar alertas')
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`Análisis completado: ${data.alertsCreated} nuevas alertas creadas`)
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = () => {
    if (selectedAlertId) {
      deleteMutation.mutate(selectedAlertId)
    }
  }

  const getRelatedLink = (alert: AlertWithRelations): string | null => {
    if (alert.project_id && alert.projects) {
      return `/dashboard/projects/${alert.project_id}`
    }
    if (alert.client_id && alert.clients) {
      return `/dashboard/clients`
    }
    return null
  }

  const getRelatedName = (alert: AlertWithRelations): string => {
    if (alert.projects?.project_name) {
      return alert.projects.project_name
    }
    if (alert.clients?.company_name) {
      return alert.clients.company_name
    }
    return '—'
  }

  const alerts = data?.alerts || []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="resolved">Resueltas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => generateAlertsMutation.mutate()}
            disabled={generateAlertsMutation.isPending}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", generateAlertsMutation.isPending && "animate-spin")} />
            {generateAlertsMutation.isPending ? 'Analizando...' : 'Generar alertas'}
          </Button>
          <Button
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Cargando...</div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No hay alertas"
          description={
            statusFilter === 'active'
              ? 'No tienes alertas pendientes'
              : 'No se encontraron alertas con los filtros seleccionados'
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Relacionado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => {
                const TypeIcon = TYPE_ICONS[alert.type]
                const relatedLink = getRelatedLink(alert)

                return (
                  <TableRow
                    key={alert.alert_id}
                    className={cn(!alert.is_read && 'bg-muted/30')}
                  >
                    <TableCell>
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">
                      {TYPE_LABELS[alert.type]}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {alert.message}
                    </TableCell>
                    <TableCell>
                      {relatedLink ? (
                        <Link
                          href={relatedLink}
                          className="text-primary hover:underline"
                        >
                          {getRelatedName(alert)}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-white border-0',
                          PRIORITY_COLORS[alert.priority]
                        )}
                      >
                        {PRIORITY_LABELS[alert.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(alert.created_at)}
                    </TableCell>
                    <TableCell>
                      {alert.resolved_at ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Resuelta
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Activa
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!alert.is_read && (
                            <DropdownMenuItem
                              onClick={() => markReadMutation.mutate(alert.alert_id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Marcar como leída
                            </DropdownMenuItem>
                          )}
                          {!alert.resolved_at && (
                            <DropdownMenuItem
                              onClick={() => resolveMutation.mutate(alert.alert_id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Resolver
                            </DropdownMenuItem>
                          )}
                          {relatedLink && (
                            <DropdownMenuItem asChild>
                              <Link href={relatedLink}>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Ver recurso
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedAlertId(alert.alert_id)
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
            <AlertDialogTitle>¿Eliminar alerta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
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
