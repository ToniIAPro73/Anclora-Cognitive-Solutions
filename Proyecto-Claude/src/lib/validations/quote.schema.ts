import { z } from 'zod'

export const quoteServiceSchema = z.object({
  name: z.string().min(1, 'El nombre del servicio es obligatorio'),
  description: z.string().optional().default(''),
  hours: z.number().min(1, 'Las horas deben ser al menos 1'),
  hourly_rate: z.number().default(85),
  amount: z.number(),
})

export const quoteContentSchema = z.object({
  introduction: z.string().min(1, 'La introducción es obligatoria'),
  services: z.array(quoteServiceSchema).min(1, 'Debe incluir al menos un servicio'),
  timeline: z.string().min(1, 'El timeline es obligatorio'),
  payment_terms: z.string().min(1, 'Las condiciones de pago son obligatorias'),
  conclusion: z.string().min(1, 'La conclusión es obligatoria'),
})

export const quoteSchema = z.object({
  project_id: z.string().uuid('Proyecto inválido'),
  language: z.enum(['es', 'en', 'ca']).default('es'),
  tone: z.string().optional(),
  content_json: quoteContentSchema,
  subtotal: z.number().min(0),
  iva: z.number().min(0),
  total: z.number().min(0),
})

export type QuoteFormData = z.infer<typeof quoteSchema>
export type QuoteServiceData = z.infer<typeof quoteServiceSchema>
export type QuoteContentData = z.infer<typeof quoteContentSchema>

// AI Generation request schema
export const quoteGenerationSchema = z.object({
  project_id: z.string().uuid(),
  language: z.enum(['es', 'en', 'ca']),
  services: z.array(z.object({
    name: z.string(),
    custom_hours: z.number().optional(),
    description_detail: z.string().optional(),
  })),
  tone: z.enum(['técnico', 'sencillo', 'formal', 'profesional', 'consultivo', 'casual']),
  technical_depth: z.number().min(1).max(10),
  include_timeline: z.boolean().default(true),
  include_payment_terms: z.boolean().default(true),
  custom_instructions: z.string().max(300).optional(),
})

export type QuoteGenerationParams = z.infer<typeof quoteGenerationSchema>

// Available services for wizard
export const AVAILABLE_SERVICES = [
  { id: 'consultoria', name: 'Consultoría inicial', minHours: 20, maxHours: 40 },
  { id: 'mvp', name: 'Desarrollo MVP', minHours: 80, maxHours: 120 },
  { id: 'finetuning', name: 'Fine-tuning de modelos', minHours: 30, maxHours: 50 },
  { id: 'rag', name: 'Implementación RAG', minHours: 40, maxHours: 60 },
  { id: 'agentes', name: 'Agentes autónomos', minHours: 60, maxHours: 100 },
  { id: 'apis', name: 'Integración APIs', minHours: 20, maxHours: 40 },
  { id: 'mantenimiento', name: 'Mantenimiento mensual', minHours: 10, maxHours: 10 },
] as const

export const TONE_OPTIONS = [
  { value: 'técnico', label: 'Técnico', description: 'Para CTOs y equipos técnicos. Incluye arquitecturas, KPIs, stack.' },
  { value: 'sencillo', label: 'Sencillo', description: 'Para audiencias no técnicas. Lenguaje claro, sin jerga.' },
  { value: 'formal', label: 'Formal', description: 'Corporativo. Referencias a estudios, estructura tradicional.' },
  { value: 'profesional', label: 'Profesional (Recomendado)', description: 'Balance técnico-comercial. Default recomendado.' },
  { value: 'consultivo', label: 'Consultivo', description: 'Énfasis en ROI, business case, impacto medible.' },
  { value: 'casual', label: 'Casual', description: 'Cercano y directo. Para startups.' },
] as const
