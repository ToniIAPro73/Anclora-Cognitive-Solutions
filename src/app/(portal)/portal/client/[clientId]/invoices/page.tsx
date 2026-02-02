'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { downloadInvoicePDF } from '@/lib/pdf'
import type { InvoiceWithProject } from '@/types/database.types'
import { Receipt, Download, Loader2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ClientInvoicesPageProps {
  params: { clientId: string }
}

const STATUS_LABELS: Record<string, string> = {
  sent: 'Pendiente',
  paid: 'Pagada',
  overdue: 'Vencida',
}

const STATUS_COLORS: Record<string, string> = {
  sent: 'bg-blue-500',
  paid: 'bg-green-600',
  overdue: 'bg-red-500',
}

export default function ClientInvoicesPage({ params }: ClientInvoicesPageProps) {
  const [invoices, setInvoices] = useState<InvoiceWithProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadInvoices() {
      const supabase = createClient()

      const { data } = await supabase
        .from('invoices')
        .select('*, projects!inner(*, clients(*))')
        .eq('projects.client_id', params.clientId)
        .in('status', ['sent', 'paid', 'overdue'])
        .order('created_at', { ascending: false })

      setInvoices((data || []) as InvoiceWithProject[])
      setIsLoading(false)
    }

    loadInvoices()
  }, [params.clientId])

  const handleDownload = async (invoice: InvoiceWithProject) => {
    setDownloadingId(invoice.invoice_id)
    try {
      await downloadInvoicePDF(invoice.invoice_id, invoice.invoice_number)
      toast.success('PDF descargado')
    } catch {
      toast.error('Error al descargar PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  // Calculate totals
  const pendingTotal = invoices
    .filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0)

  const paidTotal = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0)

  const overdueCount = invoices.filter(i => i.status === 'overdue').length

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
        <h1 className="text-2xl font-bold">Facturas</h1>
        <p className="text-muted-foreground">
          Consulta y descarga tus facturas
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pendiente de pago</p>
            <p className="text-2xl font-bold">{formatCurrency(pendingTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total pagado</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(paidTotal)}</p>
          </CardContent>
        </Card>
        {overdueCount > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-red-700">Facturas vencidas</p>
                  <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No hay facturas</h3>
            <p className="text-muted-foreground text-sm">
              Aún no tienes facturas disponibles
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const isOverdue = invoice.status === 'overdue' ||
                    (invoice.status === 'sent' && new Date(invoice.due_date) < new Date())

                  return (
                    <TableRow key={invoice.invoice_id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        {invoice.projects?.project_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invoice.issue_date)}
                      </TableCell>
                      <TableCell className={cn(isOverdue && 'text-red-600 font-medium')}>
                        {formatDate(invoice.due_date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.total)}
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
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(invoice)}
                          disabled={downloadingId === invoice.invoice_id}
                        >
                          {downloadingId === invoice.invoice_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment Info */}
      {pendingTotal > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Datos para el pago</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Titular:</span> Anclora Cognitive Solutions</p>
              <p><span className="text-muted-foreground">IBAN:</span> ES12 1234 5678 9012 3456 7890</p>
              <p className="text-muted-foreground">
                Incluye el número de factura en el concepto de la transferencia.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
