'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  sendQuoteEmail,
  sendInvoiceEmail,
  sendReminderEmail,
  type SendEmailResult,
} from '@/lib/email'
import { updateQuoteStatus } from './quotes'
import { updateInvoiceStatus } from './invoices'
import type { QuoteWithProject, InvoiceWithProject } from '@/types/database.types'

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export async function sendQuoteByEmail(
  quoteId: string,
  customMessage?: string
): Promise<ActionResult<SendEmailResult>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get quote with project and client data
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*, projects(*, clients(*))')
      .eq('quote_id', quoteId)
      .single<QuoteWithProject>()

    if (quoteError || !quote) {
      throw new Error('Presupuesto no encontrado')
    }

    const project = quote.projects
    const client = project?.clients

    if (!client?.email) {
      throw new Error('El cliente no tiene email configurado')
    }

    // Generate PDF buffer
    let pdfBuffer: Buffer | undefined
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const pdfResponse = await fetch(`${baseUrl}/api/pdf/quote/${quoteId}`)
      if (pdfResponse.ok) {
        const arrayBuffer = await pdfResponse.arrayBuffer()
        pdfBuffer = Buffer.from(arrayBuffer)
      }
    } catch (pdfError) {
      console.warn('Could not generate PDF for email attachment:', pdfError)
    }

    // Send email
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/client/${client.client_id}/quotes`

    const result = await sendQuoteEmail(
      client.email,
      {
        clientName: client.company_name || client.contact_person || 'Cliente',
        contactPerson: client.contact_person || undefined,
        projectName: project?.project_name || 'Proyecto',
        version: quote.version || 1,
        total: new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
        }).format(quote.total || 0),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
        portalUrl,
        customMessage,
      },
      pdfBuffer
    )

    if (!result.success) {
      throw new Error(result.error || 'Error al enviar email')
    }

    // Update quote status to sent
    await updateQuoteStatus(quoteId, 'sent')

    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar email',
    }
  }
}

export async function sendInvoiceByEmail(
  invoiceId: string,
  customMessage?: string
): Promise<ActionResult<SendEmailResult>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get invoice with project and client data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, projects(*, clients(*))')
      .eq('invoice_id', invoiceId)
      .single<InvoiceWithProject>()

    if (invoiceError || !invoice) {
      throw new Error('Factura no encontrada')
    }

    const project = invoice.projects
    const client = project?.clients

    if (!client?.email) {
      throw new Error('El cliente no tiene email configurado')
    }

    // Generate PDF buffer
    let pdfBuffer: Buffer | undefined
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const pdfResponse = await fetch(`${baseUrl}/api/pdf/invoice/${invoiceId}`)
      if (pdfResponse.ok) {
        const arrayBuffer = await pdfResponse.arrayBuffer()
        pdfBuffer = Buffer.from(arrayBuffer)
      }
    } catch (pdfError) {
      console.warn('Could not generate PDF for email attachment:', pdfError)
    }

    // Send email
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/client/${client.client_id}/invoices`

    const result = await sendInvoiceEmail(
      client.email,
      {
        clientName: client.company_name || client.contact_person || 'Cliente',
        contactPerson: client.contact_person || undefined,
        invoiceNumber: invoice.invoice_number,
        projectName: project?.project_name || 'Proyecto',
        issueDate: new Date(invoice.issue_date).toLocaleDateString('es-ES'),
        dueDate: new Date(invoice.due_date).toLocaleDateString('es-ES'),
        total: new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
        }).format(invoice.total || 0),
        portalUrl,
        customMessage,
      },
      pdfBuffer
    )

    if (!result.success) {
      throw new Error(result.error || 'Error al enviar email')
    }

    // Update invoice status to sent if it was draft
    if (invoice.status === 'draft') {
      await updateInvoiceStatus(invoiceId, 'sent')
    }

    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar email',
    }
  }
}

export async function sendPaymentReminderEmail(
  invoiceId: string
): Promise<ActionResult<SendEmailResult>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get invoice with project and client data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, projects(*, clients(*))')
      .eq('invoice_id', invoiceId)
      .single<InvoiceWithProject>()

    if (invoiceError || !invoice) {
      throw new Error('Factura no encontrada')
    }

    const project = invoice.projects
    const client = project?.clients

    if (!client?.email) {
      throw new Error('El cliente no tiene email configurado')
    }

    // Calculate days overdue
    const dueDate = new Date(invoice.due_date)
    const today = new Date()
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysOverdue <= 0) {
      throw new Error('La factura aún no está vencida')
    }

    // Send reminder email
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/client/${client.client_id}/invoices`

    const result = await sendReminderEmail(
      client.email,
      {
        clientName: client.company_name || client.contact_person || 'Cliente',
        contactPerson: client.contact_person || undefined,
        invoiceNumber: invoice.invoice_number,
        dueDate: dueDate.toLocaleDateString('es-ES'),
        daysOverdue,
        total: new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
        }).format(invoice.total || 0),
        portalUrl,
      }
    )

    if (!result.success) {
      throw new Error(result.error || 'Error al enviar recordatorio')
    }

    // Log the reminder sent
    await supabase.from('audit_logs')
      // @ts-ignore - Supabase types issue
      .insert({
        table_name: 'invoices',
        record_id: invoiceId,
        action: 'UPDATE',
        new_data: { reminder_sent: true, days_overdue: daysOverdue },
      })

    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar recordatorio',
    }
  }
}
