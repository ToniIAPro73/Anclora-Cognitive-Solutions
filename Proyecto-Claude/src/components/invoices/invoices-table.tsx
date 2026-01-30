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
import { getInvoices, deleteInvoice, updateInvoiceStatus } from '@/app/actions/invoices'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import type { Invoice } from '@/types/database.types'
import {
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Receipt,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<Invoice['status'], string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  paid: 'Pagada',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<Invoice['status'], string> = {
  draft: 'bg-slate-500',
  sent: 'bg-blue-500',
  paid: 'bg-green-600',
  overdue: 'bg-red-500',
  cancelled: 'bg-gray-500',
}

export function InvoicesTable() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
  }, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const result = await getInvoices()
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      toast.success('Factura eliminada')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setDeleteDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Invoice['status'] }) =>
      updateInvoiceStatus(id, status),
    onSuccess: () => {
      toast.success('Estado actualizado')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = () => {
    if (selectedInvoiceId) {
      deleteMutation.mutate(selectedInvoiceId)
    }
  }

  let invoices = data || []

  if (search) {
    invoices = invoices.filter(
      (i) =>
        i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
        i.projects?.project_name?.toLowerCase().includes(search.toLowerCase()) ||
        i.projects?.clients?.company_name?.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (statusFilter !== 'all') {
    invoices = invoices.filter((i) => i.status === statusFilter)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar facturas..."
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
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No hay facturas"
          description="Crea tu primera factura"
          actionLabel="Nueva Factura"
          actionHref="/dashboard/invoices/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const isOverdue =
                  invoice.status === 'sent' &&
                  invoice.due_date &&
                  new Date(invoice.due_date) < new Date()

                return (
                  <TableRow key={invoice.invoice_id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/invoices/${invoice.invoice_id}`}
                        className="hover:underline"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.projects?.clients?.company_name || 'Sin cliente'}
                    </TableCell>
                    <TableCell>
                      {invoice.projects?.project_name || 'Sin proyecto'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-white border-0',
                          isOverdue ? 'bg-red-500' : STATUS_COLORS[invoice.status]
                        )}
                      >
                        {isOverdue ? 'Vencida' : STATUS_LABELS[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      {invoice.due_date ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className={cn(isOverdue && 'text-red-500 font-medium')}>
                            {formatDate(invoice.due_date)}
                          </span>
                        </div>
                      ) : (
                        '—'
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
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/invoices/${invoice.invoice_id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </Link>
                          </DropdownMenuItem>
                          {invoice.pdf_url && (
                            <DropdownMenuItem asChild>
                              <a
                                href={invoice.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Descargar PDF
                              </a>
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: invoice.invoice_id,
                                  status: 'sent',
                                })
                              }
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Marcar como enviada
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'sent' && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: invoice.invoice_id,
                                  status: 'paid',
                                })
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como pagada
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'draft' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedInvoiceId(invoice.invoice_id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </>
                          )}
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
            <AlertDialogTitle>¿Eliminar factura?</AlertDialogTitle>
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
