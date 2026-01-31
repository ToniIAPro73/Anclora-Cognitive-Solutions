'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateInvoiceStatus } from '@/app/actions/invoices'
import { sendInvoiceByEmail, sendPaymentReminderEmail } from '@/app/actions/email'
import { downloadInvoicePDF } from '@/lib/pdf'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import type { InvoiceWithProject, Invoice } from '@/types/database.types'
import {
  Send,
  CheckCircle,
  XCircle,
  Download,
  MoreVertical,
  Building,
  Calendar,
  FileText,
  Loader2,
  Mail,
  Bell,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { SendEmailModal } from '@/components/email/send-email-modal'

interface InvoiceDetailProps {
  invoice: InvoiceWithProject
}

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

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const queryClient = useQueryClient()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailModalType, setEmailModalType] = useState<'invoice' | 'reminder'>('invoice')
  const lineItems = (invoice.line_items as LineItem[]) || []
  const client = invoice.projects?.clients

  const isOverdue =
    invoice.status === 'sent' &&
    invoice.due_date &&
    new Date(invoice.due_date) < new Date()

  const updateStatusMutation = useMutation({
    mutationFn: (status: Invoice['status']) => updateInvoiceStatus(invoice.invoice_id, status),
    onSuccess: () => {
      toast.success('Estado actualizado')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      await downloadInvoicePDF(invoice.invoice_id, invoice.invoice_number)
      toast.success('PDF generado correctamente')
    } catch {
      toast.error('Error al generar el PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleSendEmail = async (customMessage?: string) => {
    const result = emailModalType === 'reminder'
      ? await sendPaymentReminderEmail(invoice.invoice_id)
      : await sendInvoiceByEmail(invoice.invoice_id, customMessage)
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }
    return result
  }

  const openEmailModal = (type: 'invoice' | 'reminder') => {
    setEmailModalType(type)
    setShowEmailModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge
              variant="outline"
              className={cn(
                'text-white border-0',
                isOverdue ? 'bg-red-500' : STATUS_COLORS[invoice.status]
              )}
            >
              {isOverdue ? 'Vencida' : STATUS_LABELS[invoice.status]}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold">{invoice.invoice_number}</h2>
          <p className="text-muted-foreground">
            {invoice.projects?.project_name || 'Sin proyecto'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {client?.email && invoice.status === 'draft' && (
            <Button onClick={() => openEmailModal('invoice')}>
              <Mail className="mr-2 h-4 w-4" />
              Enviar por email
            </Button>
          )}

          {client?.email && isOverdue && (
            <Button variant="destructive" onClick={() => openEmailModal('reminder')}>
              <Bell className="mr-2 h-4 w-4" />
              Enviar recordatorio
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {invoice.status === 'draft' && (
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate('sent')}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Marcar como enviada
                </DropdownMenuItem>
              )}
              {client?.email && invoice.status === 'sent' && (
                <DropdownMenuItem onClick={() => openEmailModal('invoice')}>
                  <Mail className="mr-2 h-4 w-4" />
                  Reenviar por email
                </DropdownMenuItem>
              )}
              {invoice.status === 'sent' && (
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate('paid')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar como pagada
                </DropdownMenuItem>
              )}
              {(invoice.status === 'draft' || invoice.status === 'sent') && (
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate('cancelled')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar factura
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">
                  {invoice.projects?.clients?.company_name || 'Sin cliente'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha emisión</p>
                <p className="font-medium">{formatDate(invoice.issue_date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Vencimiento</p>
                <p className={cn('font-medium', isOverdue && 'text-red-500')}>
                  {formatDate(invoice.due_date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-medium text-lg">{formatCurrency(invoice.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de la factura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div className="col-span-6">Descripción</div>
              <div className="col-span-2 text-right">Cantidad</div>
              <div className="col-span-2 text-right">Precio</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 text-sm">
                <div className="col-span-6">{item.description}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.unit_price)}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.amount)}</div>
              </div>
            ))}

            <div className="border-t pt-4 mt-4">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (21%)</span>
                  <span>{formatCurrency(invoice.iva)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Payment info */}
      {invoice.status === 'paid' && invoice.paid_at && (
        <Card>
          <CardHeader>
            <CardTitle>Información de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Pagada el {formatDate(invoice.paid_at)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Email Modal */}
      {client && (
        <SendEmailModal
          open={showEmailModal}
          onOpenChange={setShowEmailModal}
          type={emailModalType}
          recipientEmail={client.email || ''}
          recipientName={client.company_name || client.contact_person || 'Cliente'}
          documentNumber={invoice.invoice_number}
          onSend={handleSendEmail}
        />
      )}
    </div>
  )
}
