'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { quoteSchema, type QuoteFormData } from '@/lib/validations/quote.schema'
import type { Quote, QuoteWithProject, QuoteContent } from '@/types/database.types'

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export async function getQuotes(projectId?: string): Promise<ActionResult<QuoteWithProject[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('quotes')
      .select('*, projects(*, clients(*))')
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener presupuestos',
    }
  }
}

export async function getQuoteById(quoteId: string): Promise<ActionResult<QuoteWithProject>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('quotes')
      .select('*, projects(*, clients(*))')
      .eq('quote_id', quoteId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener presupuesto',
    }
  }
}

export async function createQuote(formData: QuoteFormData): Promise<ActionResult<Quote>> {
  try {
    const validatedData = quoteSchema.parse(formData)
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('quotes')
      // @ts-ignore - Supabase types issue with custom schema
      .insert({
        project_id: validatedData.project_id,
        language: validatedData.language,
        tone: validatedData.tone || null,
        content_json: validatedData.content_json as unknown as Record<string, unknown>,
        subtotal: validatedData.subtotal,
        iva: validatedData.iva,
        total: validatedData.total,
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/quotes')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear presupuesto',
    }
  }
}

export async function updateQuote(quoteId: string, formData: Partial<QuoteFormData>): Promise<ActionResult<Quote>> {
  try {
    const supabase = await createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}

    if (formData.content_json !== undefined) {
      updateData.content_json = formData.content_json as unknown as Record<string, unknown>
    }
    if (formData.subtotal !== undefined) updateData.subtotal = formData.subtotal
    if (formData.iva !== undefined) updateData.iva = formData.iva
    if (formData.total !== undefined) updateData.total = formData.total
    if (formData.tone !== undefined) updateData.tone = formData.tone

    const { data, error } = await supabase
      .from('quotes')
      // @ts-ignore - Supabase types issue with custom schema
      .update(updateData)
      .eq('quote_id', quoteId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/quotes')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar presupuesto',
    }
  }
}

export async function updateQuoteStatus(quoteId: string, status: Quote['status']): Promise<ActionResult<Quote>> {
  try {
    const supabase = await createServerSupabaseClient()

    const updateData: Record<string, unknown> = { status }

    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString()
    }
    if (status === 'viewed') {
      updateData.viewed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('quotes')
      // @ts-ignore - Supabase types issue with custom schema
      .update(updateData)
      .eq('quote_id', quoteId)
      .select()
      .single()

    if (error) throw error

    // If quote is accepted, update project status to approved
    if (status === 'accepted') {
      const { data: quote } = await supabase
        .from('quotes')
        .select('project_id')
        .eq('quote_id', quoteId)
        .single<{ project_id: string }>()

      if (quote) {
        await supabase
          .from('projects')
          // @ts-ignore - Supabase types issue with custom schema
          .update({ status: 'approved' })
          .eq('project_id', quote.project_id)
      }
    }

    revalidatePath('/dashboard/quotes')
    revalidatePath('/dashboard/projects')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar estado',
    }
  }
}

export async function updateQuotePdfUrl(quoteId: string, pdfUrl: string): Promise<ActionResult<Quote>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('quotes')
      // @ts-ignore - Supabase types issue with custom schema
      .update({ pdf_url: pdfUrl })
      .eq('quote_id', quoteId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/quotes')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al guardar PDF',
    }
  }
}

export async function deleteQuote(quoteId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('quote_id', quoteId)

    if (error) throw error

    revalidatePath('/dashboard/quotes')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar presupuesto',
    }
  }
}

export interface AIServiceInput {
  name: string
  description: string
  estimated_hours: number
  hourly_rate: number
}

export async function generateQuoteWithAI(params: {
  project_id: string
  client_name: string
  project_name: string
  project_description?: string
  services: AIServiceInput[]
  language: 'es' | 'en' | 'ca'
  tone: string
  technical_depth: number
  custom_instructions?: string
}): Promise<ActionResult<QuoteContent>> {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'

    const response = await fetch(`${aiServiceUrl}/api/generate-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_name: params.client_name,
        project_name: params.project_name,
        project_description: params.project_description || '',
        services: params.services,
        language: params.language,
        tone: params.tone,
        technical_depth: params.technical_depth,
        custom_instructions: params.custom_instructions || '',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Error al generar presupuesto con IA')
    }

    const data = await response.json()

    if (!data.success || !data.content) {
      throw new Error(data.error || 'Respuesta inválida del servicio de IA')
    }

    return { success: true, data: data.content as QuoteContent }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar presupuesto con IA',
    }
  }
}
