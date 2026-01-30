'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { invoiceSchema, type InvoiceFormData } from '@/lib/validations/invoice.schema'
import type { Invoice, InvoiceWithProject } from '@/types/database.types'

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export async function getInvoices(projectId?: string): Promise<ActionResult<InvoiceWithProject[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('invoices')
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
      error: error instanceof Error ? error.message : 'Error al obtener facturas',
    }
  }
}

export async function getInvoiceById(invoiceId: string): Promise<ActionResult<InvoiceWithProject>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('invoices')
      .select('*, projects(*, clients(*))')
      .eq('invoice_id', invoiceId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener factura',
    }
  }
}

export async function createInvoice(formData: InvoiceFormData): Promise<ActionResult<Invoice>> {
  try {
    const validatedData = invoiceSchema.parse(formData)
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        project_id: validatedData.project_id,
        issue_date: validatedData.issue_date,
        due_date: validatedData.due_date,
        line_items: validatedData.line_items as unknown as Record<string, unknown>[],
        subtotal: validatedData.subtotal,
        iva: validatedData.iva,
        total: validatedData.total,
        notes: validatedData.notes || null,
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/invoices')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear factura',
    }
  }
}

export async function updateInvoice(invoiceId: string, formData: Partial<InvoiceFormData>): Promise<ActionResult<Invoice>> {
  try {
    const supabase = await createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}

    if (formData.issue_date !== undefined) updateData.issue_date = formData.issue_date
    if (formData.due_date !== undefined) updateData.due_date = formData.due_date
    if (formData.line_items !== undefined) {
      updateData.line_items = formData.line_items as unknown as Record<string, unknown>[]
    }
    if (formData.subtotal !== undefined) updateData.subtotal = formData.subtotal
    if (formData.iva !== undefined) updateData.iva = formData.iva
    if (formData.total !== undefined) updateData.total = formData.total
    if (formData.notes !== undefined) updateData.notes = formData.notes

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('invoice_id', invoiceId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/invoices')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar factura',
    }
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<ActionResult<Invoice>> {
  try {
    const supabase = await createServerSupabaseClient()

    const updateData: Record<string, unknown> = { status }

    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('invoice_id', invoiceId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/invoices')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar estado',
    }
  }
}

export async function updateInvoicePdfUrl(invoiceId: string, pdfUrl: string): Promise<ActionResult<Invoice>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('invoices')
      .update({ pdf_url: pdfUrl })
      .eq('invoice_id', invoiceId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/invoices')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al guardar PDF',
    }
  }
}

export async function deleteInvoice(invoiceId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Only allow deleting draft invoices
    const { data: invoice } = await supabase
      .from('invoices')
      .select('status')
      .eq('invoice_id', invoiceId)
      .single()

    if (invoice?.status !== 'draft') {
      return {
        success: false,
        error: 'Solo se pueden eliminar facturas en estado borrador',
      }
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('invoice_id', invoiceId)

    if (error) throw error

    revalidatePath('/dashboard/invoices')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar factura',
    }
  }
}

export async function importFromQuote(projectId: string): Promise<ActionResult<InvoiceFormData['line_items']>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the latest accepted quote for this project
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('content_json')
      .eq('project_id', projectId)
      .eq('status', 'accepted')
      .order('version', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    if (!quote) {
      return {
        success: false,
        error: 'No se encontró un presupuesto aceptado para este proyecto',
      }
    }

    const content = quote.content_json as { services: Array<{ name: string; hours: number; hourly_rate: number; amount: number }> }

    const lineItems = content.services.map((service) => ({
      description: service.name,
      quantity: service.hours,
      unit_price: service.hourly_rate,
      amount: service.amount,
    }))

    return { success: true, data: lineItems }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al importar desde presupuesto',
    }
  }
}
