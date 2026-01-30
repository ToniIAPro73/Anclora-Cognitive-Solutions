'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { downloadQuotePDF } from '@/lib/pdf'
import type { QuoteWithProject, QuoteContent } from '@/types/database.types'
import { FileText, Download, Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ClientQuotesPageProps {
  params: { clientId: string }
}

const STATUS_LABELS: Record<string, string> = {
  sent: 'Enviado',
  viewed: 'Visto',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
}

const STATUS_COLORS: Record<string, string> = {
  sent: 'bg-blue-500',
  viewed: 'bg-amber-500',
  accepted: 'bg-green-600',
  rejected: 'bg-red-500',
}

export default function ClientQuotesPage({ params }: ClientQuotesPageProps) {
  const [quotes, setQuotes] = useState<QuoteWithProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithProject | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuotes() {
      const supabase = createClient()

      const { data } = await supabase
        .from('quotes')
        .select('*, projects!inner(*, clients(*))')
        .eq('projects.client_id', params.clientId)
        .in('status', ['sent', 'viewed', 'accepted', 'rejected'])
        .order('created_at', { ascending: false })

      setQuotes((data || []) as QuoteWithProject[])
      setIsLoading(false)
    }

    loadQuotes()
  }, [params.clientId])

  const handleView = async (quote: QuoteWithProject) => {
    setSelectedQuote(quote)

    // Mark as viewed if not already
    if (quote.status === 'sent') {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('quotes') as any)
        .update({ status: 'viewed', viewed_at: new Date().toISOString() })
        .eq('quote_id', quote.quote_id)

      // Update local state
      setQuotes(quotes.map(q =>
        q.quote_id === quote.quote_id
          ? { ...q, status: 'viewed' as const, viewed_at: new Date().toISOString() }
          : q
      ))
    }
  }

  const handleDownload = async (quote: QuoteWithProject) => {
    setDownloadingId(quote.quote_id)
    try {
      await downloadQuotePDF(
        quote.quote_id,
        quote.projects?.project_name || 'presupuesto',
        quote.version
      )
      toast.success('PDF descargado')
    } catch {
      toast.error('Error al descargar PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  const content = selectedQuote?.content_json as QuoteContent | null

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
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        <p className="text-muted-foreground">
          Consulta y descarga tus presupuestos
        </p>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No hay presupuestos</h3>
            <p className="text-muted-foreground text-sm">
              Aún no tienes presupuestos disponibles
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.quote_id}>
                    <TableCell className="font-medium">
                      {quote.projects?.project_name}
                    </TableCell>
                    <TableCell>v{quote.version}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(quote.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(quote.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('text-white border-0', STATUS_COLORS[quote.status])}
                      >
                        {STATUS_LABELS[quote.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(quote)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(quote)}
                          disabled={downloadingId === quote.quote_id}
                        >
                          {downloadingId === quote.quote_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Quote Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQuote?.projects?.project_name} - v{selectedQuote?.version}
            </DialogTitle>
          </DialogHeader>

          {content && (
            <div className="space-y-6">
              {content.introduction && (
                <div>
                  <h4 className="font-medium mb-2">Introducción</h4>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {content.introduction}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-4">Servicios incluidos</h4>
                <div className="space-y-3">
                  {content.services?.map((service, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{service.name}</h5>
                        <span className="font-medium">{formatCurrency(service.amount)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {service.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.hours} horas × {formatCurrency(service.hourly_rate)}/h
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selectedQuote?.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (21%)</span>
                    <span>{formatCurrency(selectedQuote?.iva || 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(selectedQuote?.total || 0)}</span>
                  </div>
                </div>
              </div>

              {content.timeline && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Plazo de ejecución</h4>
                  <p className="text-sm text-muted-foreground">{content.timeline}</p>
                </div>
              )}

              {content.payment_terms && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Condiciones de pago</h4>
                  <p className="text-sm text-muted-foreground">{content.payment_terms}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => selectedQuote && handleDownload(selectedQuote)}
                  disabled={downloadingId === selectedQuote?.quote_id}
                >
                  {downloadingId === selectedQuote?.quote_id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Descargar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
