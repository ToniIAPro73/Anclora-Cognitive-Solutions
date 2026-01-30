import { z } from 'zod'

export const projectSchema = z.object({
  project_name: z
    .string()
    .min(1, 'El nombre del proyecto es obligatorio')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  client_id: z.string().uuid('Cliente inválido'),
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional()
    .nullable(),
  status: z.enum([
    'backlog',
    'proposal',
    'approved',
    'in_progress',
    'testing',
    'completed',
    'cancelled',
  ]).default('backlog'),
  budget: z
    .number()
    .min(0, 'El presupuesto no puede ser negativo')
    .optional()
    .nullable(),
  deadline: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true
      const date = new Date(val)
      return date > new Date()
    }, 'La fecha límite debe ser futura'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
})

export type ProjectFormData = z.infer<typeof projectSchema>

export const projectStatusUpdateSchema = z.object({
  project_id: z.string().uuid(),
  status: z.enum([
    'backlog',
    'proposal',
    'approved',
    'in_progress',
    'testing',
    'completed',
    'cancelled',
  ]),
})

export type ProjectStatusUpdate = z.infer<typeof projectStatusUpdateSchema>

export const projectFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum([
    'all',
    'backlog',
    'proposal',
    'approved',
    'in_progress',
    'testing',
    'completed',
    'cancelled',
  ]).optional(),
  client_id: z.string().uuid().optional(),
  priority: z.enum(['all', 'low', 'medium', 'high', 'urgent']).optional(),
  archived: z.boolean().optional(),
})

export type ProjectFilterParams = z.infer<typeof projectFilterSchema>
