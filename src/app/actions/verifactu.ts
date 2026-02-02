'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  generateVerifactuData,
  canRegisterInVerifactu,
  canRetryVerifactuRegistration,
  transformInvoiceToVerifactu,
} from '@/lib/verifactu'
import type {
  VerifactuConfig,
  VerifactuConfigUpdate,
  VerifactuLog,
  InvoiceWithProject,
} from '@/types/database.types'

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get Verifactu configuration
 */
export async function getVerifactuConfig(): Promise<ActionResult<VerifactuConfig>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('verifactu_config')
      .select('*')
      .limit(1)
      .single<VerifactuConfig>()

    if (error) throw error

    // Serialize to plain object to avoid prototype issues
    const plainData: VerifactuConfig = JSON.parse(JSON.stringify(data))

    return { success: true, data: plainData }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener configuración de Verifactu',
    }
  }
}

/**
 * Update Verifactu configuration
 */
export async function updateVerifactuConfig(
  configData: VerifactuConfigUpdate
): Promise<ActionResult<VerifactuConfig>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get existing config
    const { data: existingConfig, error: fetchError } = await supabase
      .from('verifactu_config')
      .select('config_id')
      .limit(1)
      .single<{ config_id: string }>()

    if (fetchError) throw fetchError

    // Update config
    const { data, error } = await supabase
      .from('verifactu_config')
      // @ts-ignore - Supabase types issue with custom schema
      .update(configData)
      .eq('config_id', existingConfig.config_id)
      .select()
      .single<VerifactuConfig>()

    if (error) throw error

    // Log the config update
    await logVerifactuAction(supabase, {
      invoice_id: null,
      action: 'config_update',
      status: 'success',
      request_payload: configData,
    })

    // Serialize to plain object to avoid prototype issues
    const plainData: VerifactuConfig = JSON.parse(JSON.stringify(data))

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/settings/verifactu')
    return { success: true, data: plainData }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar configuración',
    }
  }
}

/**
 * Register an invoice in Verifactu
 */
export async function registerInVerifactu(invoiceId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()

  try {
    // Get invoice with project and client data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, projects(*, clients(*))')
      .eq('invoice_id', invoiceId)
      .single()

    if (invoiceError) throw invoiceError

    // Get Verifactu config
    const { data: config, error: configError } = await supabase
      .from('verifactu_config')
      .select('*')
      .limit(1)
      .single()

    if (configError) throw configError

    // Validate registration
    const validation = canRegisterInVerifactu(invoice, config)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Set status to pending
    await supabase
      .from('invoices')
      // @ts-ignore
      .update({ verifactu_status: 'pending' })
      .eq('invoice_id', invoiceId)

    // Log the registration attempt
    const requestPayload = transformInvoiceToVerifactu(
      invoice as InvoiceWithProject,
      config,
      ''
    )

    await logVerifactuAction(supabase, {
      invoice_id: invoiceId,
      action: 'register',
      status: 'pending',
      request_payload: requestPayload,
    })

    // Generate Verifactu data (simulated registration)
    const verifactuData = await generateVerifactuData(
      invoice as InvoiceWithProject,
      config
    )

    // Update invoice with Verifactu data
    const { error: updateError } = await supabase
      .from('invoices')
      // @ts-ignore
      .update({
        verifactu_status: 'registered',
        verifactu_id: verifactuData.verifactuId,
        verifactu_hash: verifactuData.hash,
        verifactu_csv: verifactuData.csv,
        verifactu_qr: verifactuData.qr,
        verifactu_url: verifactuData.url,
        verifactu_registered_at: new Date().toISOString(),
        verifactu_error_message: null,
      })
      .eq('invoice_id', invoiceId)

    if (updateError) throw updateError

    // Log success
    await logVerifactuAction(supabase, {
      invoice_id: invoiceId,
      action: 'register',
      status: 'success',
      response_payload: verifactuData,
    })

    revalidatePath('/dashboard/invoices')
    revalidatePath(`/dashboard/invoices/${invoiceId}`)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al registrar en Verifactu'

    // Update invoice with error status
    await supabase
      .from('invoices')
      // @ts-ignore
      .update({
        verifactu_status: 'error',
        verifactu_error_message: errorMessage,
      })
      .eq('invoice_id', invoiceId)

    // Log error
    await logVerifactuAction(supabase, {
      invoice_id: invoiceId,
      action: 'register',
      status: 'error',
      error_message: errorMessage,
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Retry a failed Verifactu registration
 */
export async function retryVerifactuRegistration(invoiceId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()

  try {
    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, projects(*, clients(*))')
      .eq('invoice_id', invoiceId)
      .single()

    if (invoiceError) throw invoiceError

    // Validate retry
    const validation = canRetryVerifactuRegistration(invoice)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Log retry attempt
    await logVerifactuAction(supabase, {
      invoice_id: invoiceId,
      action: 'retry',
      status: 'pending',
    })

    // Reset status and attempt registration again
    await supabase
      .from('invoices')
      // @ts-ignore
      .update({
        verifactu_status: 'not_registered',
        verifactu_error_message: null,
      })
      .eq('invoice_id', invoiceId)

    // Call register function
    return await registerInVerifactu(invoiceId)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al reintentar registro'

    await logVerifactuAction(supabase, {
      invoice_id: invoiceId,
      action: 'retry',
      status: 'error',
      error_message: errorMessage,
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Get Verifactu logs for an invoice
 */
export async function getVerifactuLogs(invoiceId: string): Promise<ActionResult<VerifactuLog[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('verifactu_logs')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener logs de Verifactu',
    }
  }
}

/**
 * Cancel a Verifactu registration (for cancelled invoices)
 */
export async function cancelVerifactuRegistration(invoiceId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()

  try {
    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('verifactu_status')
      .eq('invoice_id', invoiceId)
      .single<{ verifactu_status: string | null }>()

    if (invoiceError) throw invoiceError

    if (invoice.verifactu_status !== 'registered') {
      return {
        success: false,
        error: 'Solo se pueden anular registros de facturas registradas',
      }
    }

    // Log cancellation attempt
    await logVerifactuAction(supabase, {
      invoice_id: invoiceId,
      action: 'cancel',
      status: 'pending',
    })

    // Update invoice status
    const { error: updateError } = await supabase
      .from('invoices')
      // @ts-ignore
      .update({
        verifactu_status: 'cancelled',
      })
      .eq('invoice_id', invoiceId)

    if (updateError) throw updateError

    // Log success
    await logVerifactuAction(supabase, {
      invoice_id: invoiceId,
      action: 'cancel',
      status: 'success',
    })

    revalidatePath('/dashboard/invoices')
    revalidatePath(`/dashboard/invoices/${invoiceId}`)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al anular registro'

    await logVerifactuAction(supabase, {
      invoice_id: invoiceId,
      action: 'cancel',
      status: 'error',
      error_message: errorMessage,
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Helper function to log Verifactu actions
 */
async function logVerifactuAction(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  logData: {
    invoice_id: string | null
    action: 'register' | 'retry' | 'cancel' | 'query' | 'config_update'
    status: 'pending' | 'success' | 'error'
    request_payload?: unknown
    response_payload?: unknown
    error_message?: string
  }
): Promise<void> {
  try {
    await supabase
      .from('verifactu_logs')
      // @ts-ignore
      .insert({
        invoice_id: logData.invoice_id,
        action: logData.action,
        status: logData.status,
        request_payload: logData.request_payload || null,
        response_payload: logData.response_payload || null,
        error_message: logData.error_message || null,
      })
  } catch (error) {
    console.error('Error logging Verifactu action:', error)
  }
}
