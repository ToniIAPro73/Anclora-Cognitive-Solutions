import { z } from 'zod'

// Spanish NIF/CIF regex validation
const nifCifRegex = /^[XYZ]?\d{7,8}[A-Z]$/i

// E.164 phone format
const phoneRegex = /^\+[1-9]\d{1,14}$/

export const clientSchema = z.object({
  company_name: z
    .string()
    .min(1, 'El nombre de la empresa es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Formato de email inválido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  contact_person: z
    .string()
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(phoneRegex, 'Formato de teléfono inválido (use formato E.164, ej: +34612345678)')
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  nif_cif: z
    .string()
    .regex(nifCifRegex, 'Formato de NIF/CIF inválido')
    .optional()
    .nullable()
    .or(z.literal('')),
  preferred_language: z.enum(['es', 'en', 'ca']).default('es'),
  notes: z.string().optional().nullable(),
})

export type ClientFormData = z.infer<typeof clientSchema>

// Schema for search/filter params
export const clientFilterSchema = z.object({
  search: z.string().optional(),
  language: z.enum(['all', 'es', 'en', 'ca']).optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'company_name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
})

export type ClientFilterParams = z.infer<typeof clientFilterSchema>
