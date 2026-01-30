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
import { updateQuoteStatus } from '@/app/actions/quotes'
import { sendQuoteByEmail } from '@/app/actions/email'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import type { QuoteWithProject, Quote, QuoteContent } from '@/types/database.types'
import {
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Download,
  MoreVertical,
  Building,
  Calendar,
  User,
  Loader2,
  Mail,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { downloadQuotePDF } from '@/lib/pdf'
import { SendEmailModal } from '@/components/email/send-email-modal'

interface QuoteDetailProps {
  quote: QuoteWithProject
}

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

export function QuoteDetail({ quote }: QuoteDetailProps) {
  const queryClient = useQueryClient()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const content = quote.content_json as QuoteContent | null
  const client = quote.projects?.clients

  const updateStatusMutation = useMutation({
    mutationFn: (status: Quote['status']) => updateQuoteStatus(quote.quote_id, status),
    onSuccess: () => {
      toast.success('Estado actualizado')
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      await downloadQuotePDF(
        quote.quote_id,
        quote.projects?.project_name || 'presupuesto',
        quote.version
      )
      toast.success('PDF generado correctamente')
    } catch {
      toast.error('Error al generar el PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleSendEmail = async (customMessage?: string) => {
    const result = await sendQuoteByEmail(quote.quote_id, customMessage)
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    }
    return result
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge
              variant="outline"
              className={cn('text-white border-0', STATUS_COLORS[quote.status])}
            >
              {STATUS_LABELS[quote.status]}
            </Badge>
            <Badge variant="outline">v{quote.version}</Badge>
          </div>
          <h2 className="text-2xl font-bold">
            {quote.projects?.project_name || 'Sin proyecto'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {client?.email && quote.status === 'draft' && (
            <Button onClick={() => setShowEmailModal(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Enviar por email
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
              {quote.status === 'draft' && (
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate('sent')}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Marcar como enviado
                </DropdownMenuItem>
              )}
              {client?.email && quote.status !== 'draft' && (
                <DropdownMenuItem onClick={() => setShowEmailModal(true)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Reenviar por email
                </DropdownMenuItem>
              )}
              {(quote.status === 'sent' || quote.status === 'viewed') && (
                <>
                  <DropdownMenuItem
                    onClick={() => updateStatusMutation.mutate('accepted')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar como aceptado
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateStatusMutation.mutate('rejected')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Marcar como rechazado
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">
                  {quote.projects?.clients?.company_name || 'Sin cliente'}
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
                <p className="text-sm text-muted-foreground">Fecha creación</p>
                <p className="font-medium">{formatDate(quote.created_at)}</p>
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
                <p className="font-medium text-lg">{formatCurrency(quote.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {content && (
        <Card>
          <CardHeader>
            <CardTitle>Contenido del presupuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {content.introduction && (
              <div>
                <h4 className="font-medium mb-2">Introducción</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {content.introduction}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-4">Servicios</h4>
              <div className="space-y-4">
                {content.services?.map((service, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{service.name}</h5>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {service.hours}h × {formatCurrency(service.hourly_rate)}/h
                        </p>
                        <p className="font-medium">{formatCurrency(service.total)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (21%)</span>
                  <span>{formatCurrency(quote.iva)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </div>

            {content.payment_terms && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Términos de pago</h4>
                <p className="text-muted-foreground">{content.payment_terms}</p>
              </div>
            )}

            {content.validity && (
              <div>
                <h4 className="font-medium mb-2">Validez</h4>
                <p className="text-muted-foreground">{content.validity}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <p className="text-sm">
                <span className="font-medium">Creado</span>
                <span className="text-muted-foreground ml-2">
                  {formatDate(quote.created_at)}
                </span>
              </p>
            </div>
            {quote.sent_at && (
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <p className="text-sm">
                  <span className="font-medium">Enviado</span>
                  <span className="text-muted-foreground ml-2">
                    {formatDate(quote.sent_at)}
                  </span>
                </p>
              </div>
            )}
            {quote.viewed_at && (
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <p className="text-sm">
                  <span className="font-medium">Visto por el cliente</span>
                  <span className="text-muted-foreground ml-2">
                    {formatDate(quote.viewed_at)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Modal */}
      {client && (
        <SendEmailModal
          open={showEmailModal}
          onOpenChange={setShowEmailModal}
          type="quote"
          recipientEmail={client.email || ''}
          recipientName={client.company_name || client.contact_name || 'Cliente'}
          documentNumber={`v${quote.version}`}
          onSend={handleSendEmail}
        />
      )}
    </div>
  )
}
