import { z } from "zod"

export const projectSchema = z.object({
  project_name: z.string().min(1, "El nombre del proyecto es obligatorio").max(150),
  client_id: z.string().uuid("Selecciona un cliente válido"),
  description: z.string().max(2000).optional(),
  status: z.enum([
    'backlog', 
    'proposal', 
    'approved', 
    'in_progress', 
    'testing', 
    'completed', 
    'cancelled'
  ]).default('backlog'),
  budget: z.coerce.number().min(0, "El presupuesto no puede ser negativo").optional(),
  deadline: z.string().refine((date) => {
    if (!date) return true
    return new Date(date) > new Date()
  }, "La fecha límite debe ser futura").optional().or(z.literal("")),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

// Matrix translation validation
export const allowedTransitions: Record<string, string[]> = {
  backlog: ['proposal', 'cancelled'],
  proposal: ['approved', 'cancelled', 'backlog'],
  approved: ['in_progress', 'cancelled'],
  in_progress: ['testing', 'cancelled'],
  testing: ['in_progress', 'completed', 'cancelled'],
  completed: [],
  cancelled: ['backlog'],
}

export function isTransitionAllowed(from: string, to: string) {
  if (from === to) return true
  return allowedTransitions[from]?.includes(to) ?? false
}
