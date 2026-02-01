'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Copy, Check, ExternalLink, QrCode, FileCheck } from 'lucide-react'
import toast from 'react-hot-toast'

interface VerifactuQRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceNumber: string
  verifactuId: string | null
  verifactuQr: string | null
  verifactuCsv: string | null
  verifactuUrl: string | null
  verifactuHash: string | null
  registeredAt: string | null
}

export function VerifactuQRModal({
  open,
  onOpenChange,
  invoiceNumber,
  verifactuId,
  verifactuQr,
  verifactuCsv,
  verifactuUrl,
  verifactuHash,
  registeredAt,
}: VerifactuQRModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copiado al portapapeles')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-emerald-500" />
            Verifactu - {invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status badge */}
          <div className="flex items-center justify-center">
            <Badge className="bg-emerald-500 text-white border-0 text-sm px-4 py-1">
              Registrada en Verifactu
            </Badge>
          </div>

          {/* QR Code */}
          {verifactuQr && (
            <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">
                Código QR de verificación
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <img
                  src={verifactuQr}
                  alt="Código QR Verifactu"
                  className="w-40 h-40"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Escanea este código para verificar la factura
              </p>
            </div>
          )}

          {/* CSV Code */}
          {verifactuCsv && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Código CSV
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                  {verifactuCsv}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(verifactuCsv, 'csv')}
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
          {verifactuUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Enlace de verificación AEAT
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1 justify-start overflow-hidden"
                  asChild
                >
                  <a
                    href={verifactuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Verificar en AEAT</span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(verifactuUrl, 'url')}
                >
                  {copiedField === 'url' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Additional info */}
          <div className="space-y-3 pt-4 border-t">
            {verifactuId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID Verifactu</span>
                <code className="font-mono text-xs">{verifactuId}</code>
              </div>
            )}
            {registeredAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fecha de registro</span>
                <span>{formatDate(registeredAt)}</span>
              </div>
            )}
            {verifactuHash && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hash</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(verifactuHash, 'hash')}
                  >
                    {copiedField === 'hash' ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <code className="block text-xs font-mono break-all bg-muted px-2 py-1 rounded">
                  {verifactuHash}
                </code>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
