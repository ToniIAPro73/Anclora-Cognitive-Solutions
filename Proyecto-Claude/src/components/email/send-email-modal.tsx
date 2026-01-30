'use client'

import { useState } from 'react'
import { Mail, Send, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SendEmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'quote' | 'invoice' | 'reminder'
  recipientEmail: string
  recipientName: string
  documentNumber?: string
  onSend: (customMessage?: string) => Promise<{ success: boolean; error?: string }>
}

export function SendEmailModal({
  open,
  onOpenChange,
  type,
  recipientEmail,
  recipientName,
  documentNumber,
  onSend,
}: SendEmailModalProps) {
  const [customMessage, setCustomMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)

  const typeLabels = {
    quote: {
      title: 'Enviar presupuesto',
      description: 'Se enviará el presupuesto por email con el PDF adjunto.',
      successMessage: 'Presupuesto enviado correctamente',
    },
    invoice: {
      title: 'Enviar factura',
      description: 'Se enviará la factura por email con el PDF adjunto.',
      successMessage: 'Factura enviada correctamente',
    },
    reminder: {
      title: 'Enviar recordatorio de pago',
      description: 'Se enviará un recordatorio de pago al cliente.',
      successMessage: 'Recordatorio enviado correctamente',
    },
  }

  const labels = typeLabels[type]

  const handleSend = async () => {
    setSending(true)
    setResult(null)

    try {
      const sendResult = await onSend(customMessage || undefined)
      setResult(sendResult)

      if (sendResult.success) {
        setTimeout(() => {
          onOpenChange(false)
          setCustomMessage('')
          setResult(null)
        }, 2000)
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error al enviar',
      })
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (!sending) {
      onOpenChange(false)
      setCustomMessage('')
      setResult(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {labels.title}
          </DialogTitle>
          <DialogDescription>
            {labels.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Destinatario:</span>
              <span className="font-medium">{recipientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{recipientEmail}</span>
            </div>
            {documentNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {type === 'quote' ? 'Presupuesto:' : 'Factura:'}
                </span>
                <span className="font-medium">{documentNumber}</span>
              </div>
            )}
          </div>

          {type !== 'reminder' && (
            <div className="space-y-2">
              <Label htmlFor="custom-message">
                Mensaje personalizado (opcional)
              </Label>
              <Textarea
                id="custom-message"
                placeholder="Añade un mensaje personalizado que se incluirá en el email..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                disabled={sending}
              />
            </div>
          )}

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success ? labels.successMessage : result.error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={sending}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={sending || result?.success}>
            {sending ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
