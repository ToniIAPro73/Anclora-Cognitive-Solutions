'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createInvoice } from '@/app/actions/invoices'
import { invoiceSchema, type InvoiceFormData } from '@/lib/validations/invoice.schema'
import type { QuoteWithProject } from '@/types/database.types'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface InvoiceFormProps {
  quotes: QuoteWithProject[]
}

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export function InvoiceForm({ quotes }: InvoiceFormProps) {
  const router = useRouter()
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, amount: 0 },
  ])

  const selectedQuote = quotes.find((q) => q.quote_id === selectedQuoteId)
  const projectId = selectedQuote?.project_id || ''

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const iva = subtotal * 0.21
  const total = subtotal + iva

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      project_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      line_items: [],
      subtotal: 0,
      iva: 0,
      total: 0,
      notes: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Factura creada correctamente')
        router.push(`/dashboard/invoices/${result.data!.invoice_id}`)
      } else {
        toast.error(result.error || 'Error al crear factura')
      }
    },
    onError: () => {
      toast.error('Error al crear factura')
    },
  })

  const handleQuoteSelect = (quoteId: string) => {
    setSelectedQuoteId(quoteId)
    const quote = quotes.find((q) => q.quote_id === quoteId)

    if (quote) {
      setValue('project_id', quote.project_id)

      const content = quote.content_json as { services?: Array<{ name: string; hours: number; hourly_rate: number; total: number }> } | null

      if (content?.services) {
        const items = content.services.map((s) => ({
          description: s.name,
          quantity: s.hours,
          unit_price: s.hourly_rate,
          amount: s.total,
        }))
        setLineItems(items)
      }
    }
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...lineItems]
    const item = { ...newItems[index] }

    if (field === 'description') {
      item.description = value as string
    } else {
      item[field] = Number(value) || 0
    }

    if (field === 'quantity' || field === 'unit_price') {
      item.amount = item.quantity * item.unit_price
    }

    newItems[index] = item
    setLineItems(newItems)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, amount: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const onSubmit = (data: InvoiceFormData) => {
    createMutation.mutate({
      ...data,
      project_id: projectId,
      line_items: lineItems,
      subtotal,
      iva,
      total,
    })
  }

  const isLoading = createMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Nueva Factura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Presupuesto aceptado *</Label>
            <Select value={selectedQuoteId} onValueChange={handleQuoteSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un presupuesto" />
              </SelectTrigger>
              <SelectContent>
                {quotes.map((quote) => (
                  <SelectItem key={quote.quote_id} value={quote.quote_id}>
                    {quote.projects?.project_name} - {quote.projects?.clients?.company_name} (v{quote.version})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedQuoteId && (
              <p className="text-sm text-muted-foreground">
                Selecciona un presupuesto para importar los datos
              </p>
            )}
          </div>

          {selectedQuoteId && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Fecha de emisión *</Label>
                  <Input id="issue_date" type="date" {...register('issue_date')} />
                  {errors.issue_date && (
                    <p className="text-sm text-red-500">{errors.issue_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Fecha de vencimiento *</Label>
                  <Input id="due_date" type="date" {...register('due_date')} />
                  {errors.due_date && (
                    <p className="text-sm text-red-500">{errors.due_date.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Líneas de factura</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir línea
                  </Button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Descripción"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        />
                        <div className="flex gap-2">
                          <div className="w-24">
                            <Input
                              type="number"
                              placeholder="Cant."
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                            />
                          </div>
                          <div className="w-32">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Precio"
                              value={item.unit_price}
                              onChange={(e) => updateLineItem(index, 'unit_price', e.target.value)}
                            />
                          </div>
                          <div className="w-32">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Total"
                              value={item.amount.toFixed(2)}
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA (21%)</span>
                    <span>{iva.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales..."
                  rows={3}
                  {...register('notes')}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || !selectedQuoteId}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear factura
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
