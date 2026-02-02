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
import { getQuotes, deleteQuote, updateQuoteStatus } from '@/app/actions/quotes'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import type { Quote } from '@/types/database.types'
import {
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<Quote['status'], string> = {
  draft: 'Borrador',
  sent: 'Enviado',
  viewed: 'Visto',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
}

const STATUS_COLORS: Record<Quote['status'], string> = {
  draft: 'bg-slate-500',
  sent: 'bg-blue-500',
  viewed: 'bg-amber-500',
  accepted: 'bg-green-600',
  rejected: 'bg-red-500',
}

const STATUS_ICONS: Record<Quote['status'], React.ReactNode> = {
  draft: <FileText className="h-3 w-3" />,
  sent: <Send className="h-3 w-3" />,
  viewed: <Eye className="h-3 w-3" />,
  accepted: <CheckCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
}

export function QuotesTable() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null)

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
  }, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const result = await getQuotes()
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      toast.success('Presupuesto eliminado')
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      setDeleteDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Quote['status'] }) =>
      updateQuoteStatus(id, status),
    onSuccess: () => {
      toast.success('Estado actualizado')
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = () => {
    if (selectedQuoteId) {
      deleteMutation.mutate(selectedQuoteId)
    }
  }

  let quotes = data || []

  if (search) {
    quotes = quotes.filter(
      (q) =>
        q.projects?.project_name?.toLowerCase().includes(search.toLowerCase()) ||
        q.projects?.clients?.company_name?.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (statusFilter !== 'all') {
    quotes = quotes.filter((q) => q.status === statusFilter)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar presupuestos..."
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
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Cargando...</div>
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No hay presupuestos"
          description="Crea tu primer presupuesto con ayuda de IA"
          actionLabel="Nuevo Presupuesto"
          actionHref="/dashboard/quotes/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Versión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.quote_id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/quotes/${quote.quote_id}`}
                      className="hover:underline"
                    >
                      {quote.projects?.project_name || 'Sin proyecto'}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {quote.projects?.clients?.company_name || 'Sin cliente'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">v{quote.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('text-white border-0 gap-1', STATUS_COLORS[quote.status])}
                    >
                      {STATUS_ICONS[quote.status]}
                      {STATUS_LABELS[quote.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(quote.total)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDate(quote.created_at)}
                    </div>
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
                          <Link href={`/dashboard/quotes/${quote.quote_id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        {quote.status === 'draft' && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: quote.quote_id,
                                status: 'sent',
                              })
                            }
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Marcar como enviado
                          </DropdownMenuItem>
                        )}
                        {(quote.status === 'sent' || quote.status === 'viewed') && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: quote.quote_id,
                                  status: 'accepted',
                                })
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como aceptado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: quote.quote_id,
                                  status: 'rejected',
                                })
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Marcar como rechazado
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedQuoteId(quote.quote_id)
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
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
