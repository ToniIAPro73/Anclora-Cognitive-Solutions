'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Alert, AlertType, AlertPriority } from '@/types/database.types'

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface AlertWithRelations extends Alert {
  projects?: {
    project_id: string
    project_name: string
  } | null
  clients?: {
    client_id: string
    company_name: string
  } | null
}

export interface AlertFilterParams {
  type?: AlertType | 'all'
  priority?: AlertPriority | 'all'
  status?: 'active' | 'resolved' | 'all'
  page?: number
  limit?: number
}

export async function getAlerts(params?: AlertFilterParams): Promise<ActionResult<{ alerts: AlertWithRelations[]; total: number }>> {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('alerts')
      .select('*, projects(project_id, project_name), clients(client_id, company_name)', { count: 'exact' })

    if (params?.type && params.type !== 'all') {
      query = query.eq('type', params.type)
    }

    if (params?.priority && params.priority !== 'all') {
      query = query.eq('priority', params.priority)
    }

    if (params?.status === 'active') {
      query = query.is('resolved_at', null)
    } else if (params?.status === 'resolved') {
      query = query.not('resolved_at', 'is', null)
    }

    query = query.order('created_at', { ascending: false })

    const page = params?.page || 1
    const limit = params?.limit || 50
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return {
      success: true,
      data: {
        alerts: (data || []) as AlertWithRelations[],
        total: count || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener alertas',
    }
  }
}

export async function getUnreadAlertsCount(): Promise<ActionResult<number>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { count, error } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .is('resolved_at', null)

    if (error) throw error

    return { success: true, data: count || 0 }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener contador de alertas',
    }
  }
}

export async function getRecentAlerts(limit: number = 10): Promise<ActionResult<AlertWithRelations[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('alerts')
      .select('*, projects(project_id, project_name), clients(client_id, company_name)')
      .eq('is_read', false)
      .is('resolved_at', null)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { success: true, data: (data || []) as AlertWithRelations[] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener alertas recientes',
    }
  }
}

export async function markAlertAsRead(alertId: string): Promise<ActionResult<Alert>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('alerts')
      // @ts-ignore - Supabase types issue
      .update({ is_read: true })
      .eq('alert_id', alertId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/alerts')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al marcar alerta como leída',
    }
  }
}

export async function markAllAlertsAsRead(): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('alerts')
      // @ts-ignore - Supabase types issue
      .update({ is_read: true })
      .eq('is_read', false)

    if (error) throw error

    revalidatePath('/dashboard/alerts')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al marcar alertas como leídas',
    }
  }
}

export async function resolveAlert(alertId: string): Promise<ActionResult<Alert>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('alerts')
      // @ts-ignore - Supabase types issue
      .update({
        resolved_at: new Date().toISOString(),
        is_read: true,
      })
      .eq('alert_id', alertId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/alerts')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al resolver alerta',
    }
  }
}

export async function deleteAlert(alertId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('alert_id', alertId)

    if (error) throw error

    revalidatePath('/dashboard/alerts')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar alerta',
    }
  }
}

export async function createAlert(data: {
  type: AlertType
  message: string
  priority?: AlertPriority
  project_id?: string
  client_id?: string
}): Promise<ActionResult<Alert>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: alert, error } = await supabase
      .from('alerts')
      // @ts-ignore - Supabase types issue
      .insert({
        type: data.type,
        message: data.message,
        priority: data.priority || 'medium',
        project_id: data.project_id || null,
        client_id: data.client_id || null,
        is_read: false,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/alerts')
    return { success: true, data: alert }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear alerta',
    }
  }
}
