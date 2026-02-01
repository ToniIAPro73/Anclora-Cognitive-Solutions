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
import { registerInVerifactu, retryVerifactuRegistration } from '@/app/actions/verifactu'
import { downloadInvoicePDF } from '@/lib/pdf'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import type { InvoiceWithProject, Invoice } from '@/types/database.types'
import { VerifactuStatusBadge } from '@/components/invoices/verifactu-status-badge'
import { VerifactuQRModal } from '@/components/invoices/verifactu-qr-modal'
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
  FileCheck,
  RefreshCw,
  QrCode,
  ExternalLink,
  Copy,
  Check,
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
  const [showQRModal, setShowQRModal] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const lineItems = (invoice.line_items as LineItem[]) || []
  const client = invoice.projects?.clients

  const isOverdue =
    invoice.status === 'sent' &&
    invoice.due_date &&
    new Date(invoice.due_date) < new Date()

  const canRegisterVerifactu =
    (invoice.status === 'sent' || invoice.status === 'paid') &&
    invoice.verifactu_status === 'not_registered'

  const canRetryVerifactu = invoice.verifactu_status === 'error'

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

  const registerVerifactuMutation = useMutation({
    mutationFn: async () => {
      const result = await registerInVerifactu(invoice.invoice_id)
      if (!result.success) {
        throw new Error(result.error || 'Error al registrar en Verifactu')
      }
      return result
    },
    onSuccess: () => {
      toast.success('Factura registrada en Verifactu')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const retryVerifactuMutation = useMutation({
    mutationFn: async () => {
      const result = await retryVerifactuRegistration(invoice.invoice_id)
      if (!result.success) {
        throw new Error(result.error || 'Error al reintentar registro')
      }
      return result
    },
    onSuccess: () => {
      toast.success('Factura registrada en Verifactu')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copiado al portapapeles')
    setTimeout(() => setCopiedField(null), 2000)
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

          {(invoice.status === 'draft' || invoice.status === 'sent') && (
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
          )}
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

      {/* Verifactu Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Verifactu
            </CardTitle>
            <VerifactuStatusBadge
              status={invoice.verifactu_status || 'not_registered'}
              errorMessage={invoice.verifactu_error_message}
            />
          </div>
        </CardHeader>
        <CardContent>
          {invoice.verifactu_status === 'not_registered' && (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Esta factura no está registrada en Verifactu
              </p>
              {canRegisterVerifactu && (
                <Button
                  onClick={() => registerVerifactuMutation.mutate()}
                  disabled={registerVerifactuMutation.isPending}
                >
                  {registerVerifactuMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileCheck className="mr-2 h-4 w-4" />
                  )}
                  Registrar en Verifactu
                </Button>
              )}
              {invoice.status === 'draft' && (
                <p className="text-sm text-muted-foreground mt-2">
                  Las facturas en borrador no pueden registrarse
                </p>
              )}
            </div>
          )}

          {invoice.verifactu_status === 'pending' && (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-500" />
              <p className="text-muted-foreground">
                Registro en proceso...
              </p>
            </div>
          )}

          {invoice.verifactu_status === 'error' && (
            <div className="text-center py-4">
              <p className="text-red-500 mb-4">
                {invoice.verifactu_error_message || 'Error al registrar en Verifactu'}
              </p>
              {canRetryVerifactu && (
                <Button
                  variant="outline"
                  onClick={() => retryVerifactuMutation.mutate()}
                  disabled={retryVerifactuMutation.isPending}
                >
                  {retryVerifactuMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Reintentar registro
                </Button>
              )}
            </div>
          )}

          {invoice.verifactu_status === 'registered' && (
            <div className="space-y-6">
              {/* QR Code preview */}
              {invoice.verifactu_qr && (
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm border">
                    <img
                      src={invoice.verifactu_qr}
                      alt="Código QR Verifactu"
                      className="w-32 h-32 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setShowQRModal(true)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQRModal(true)}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Ver QR completo
                  </Button>
                </div>
              )}

              {/* CSV Code */}
              {invoice.verifactu_csv && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Código CSV
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                      {invoice.verifactu_csv}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(invoice.verifactu_csv!, 'csv')}
                    >
                      {copiedField === 'csv' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Verification URL */}
              {invoice.verifactu_url && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Enlace de verificación AEAT
                  </label>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href={invoice.verifactu_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Verificar en la web de la AEAT
                    </a>
                  </Button>
                </div>
              )}

              {/* Registration date */}
              {invoice.verifactu_registered_at && (
                <div className="pt-4 border-t text-sm text-muted-foreground">
                  Registrada el{' '}
                  {new Date(invoice.verifactu_registered_at).toLocaleString('es-ES', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              )}
            </div>
          )}

          {invoice.verifactu_status === 'cancelled' && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                El registro de esta factura ha sido anulado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Verifactu QR Modal */}
      <VerifactuQRModal
        open={showQRModal}
        onOpenChange={setShowQRModal}
        invoiceNumber={invoice.invoice_number}
        verifactuId={invoice.verifactu_id}
        verifactuQr={invoice.verifactu_qr}
        verifactuCsv={invoice.verifactu_csv}
        verifactuUrl={invoice.verifactu_url}
        verifactuHash={invoice.verifactu_hash}
        registeredAt={invoice.verifactu_registered_at}
      />
    </div>
  )
}
