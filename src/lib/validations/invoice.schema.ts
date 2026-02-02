import { z } from 'zod'

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'La descripción es obligatoria'),
  quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
  unit_price: z.number().min(0, 'El precio no puede ser negativo'),
  amount: z.number(),
})

export const invoiceSchema = z.object({
  project_id: z.string().uuid('Proyecto inválido'),
  issue_date: z.string().refine((val) => {
    const date = new Date(val)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return date <= today
  }, 'La fecha de emisión no puede ser futura'),
  due_date: z.string(),
  line_items: z.array(invoiceLineItemSchema).min(1, 'Debe incluir al menos una línea'),
  subtotal: z.number().min(0),
  iva: z.number().min(0),
  total: z.number().min(0),
  notes: z.string().optional().nullable(),
}).refine((data) => {
  const issueDate = new Date(data.issue_date)
  const dueDate = new Date(data.due_date)
  return dueDate > issueDate
}, {
  message: 'La fecha de vencimiento debe ser posterior a la fecha de emisión',
  path: ['due_date'],
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type InvoiceLineItemData = z.infer<typeof invoiceLineItemSchema>

export const invoiceFilterSchema = z.object({
  status: z.enum(['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  client_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})

export type InvoiceFilterParams = z.infer<typeof invoiceFilterSchema>
