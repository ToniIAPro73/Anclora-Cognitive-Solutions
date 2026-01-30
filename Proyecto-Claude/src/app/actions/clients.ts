'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { clientSchema, type ClientFormData, type ClientFilterParams } from '@/lib/validations/client.schema'
import type { Client } from '@/types/database.types'

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export async function getClients(params?: ClientFilterParams): Promise<ActionResult<{ clients: Client[]; total: number }>> {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })

    if (params?.search) {
      query = query.or(`company_name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
    }

    if (params?.language && params.language !== 'all') {
      query = query.eq('preferred_language', params.language)
    }

    const sortBy = params?.sortBy || 'created_at'
    const sortOrder = params?.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const page = params?.page || 1
    const limit = params?.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return {
      success: true,
      data: {
        clients: data || [],
        total: count || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener clientes',
    }
  }
}

export async function getClientById(clientId: string): Promise<ActionResult<Client>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('client_id', clientId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener cliente',
    }
  }
}

export async function createClient(formData: ClientFormData): Promise<ActionResult<Client>> {
  try {
    const validatedData = clientSchema.parse(formData)
    const supabase = await createServerSupabaseClient()

    // Check if email already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('client_id')
      .eq('email', validatedData.email)
      .single()

    if (existing) {
      return { success: false, error: 'Ya existe un cliente con este email' }
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        company_name: validatedData.company_name,
        email: validatedData.email,
        contact_person: validatedData.contact_person || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        nif_cif: validatedData.nif_cif || null,
        preferred_language: validatedData.preferred_language,
        notes: validatedData.notes || null,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/clients')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear cliente',
    }
  }
}

export async function updateClient(clientId: string, formData: ClientFormData): Promise<ActionResult<Client>> {
  try {
    const validatedData = clientSchema.parse(formData)
    const supabase = await createServerSupabaseClient()

    // Check if email already exists for another client
    const { data: existing } = await supabase
      .from('clients')
      .select('client_id')
      .eq('email', validatedData.email)
      .neq('client_id', clientId)
      .single()

    if (existing) {
      return { success: false, error: 'Ya existe otro cliente con este email' }
    }

    const { data, error } = await supabase
      .from('clients')
      .update({
        company_name: validatedData.company_name,
        email: validatedData.email,
        contact_person: validatedData.contact_person || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        nif_cif: validatedData.nif_cif || null,
        preferred_language: validatedData.preferred_language,
        notes: validatedData.notes || null,
      })
      .eq('client_id', clientId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/clients')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar cliente',
    }
  }
}

export async function deleteClient(clientId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Check if client has active projects
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .neq('status', 'cancelled')
      .eq('archived', false)

    if (count && count > 0) {
      return {
        success: false,
        error: 'No se puede eliminar el cliente porque tiene proyectos activos. Archive los proyectos primero.',
      }
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('client_id', clientId)

    if (error) throw error

    revalidatePath('/dashboard/clients')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar cliente',
    }
  }
}

export async function checkEmailUnique(email: string, excludeClientId?: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('clients')
      .select('client_id')
      .eq('email', email)

    if (excludeClientId) {
      query = query.neq('client_id', excludeClientId)
    }

    const { data } = await query.single()
    return !data
  } catch {
    return true
  }
}

export async function getClientsForSelect(): Promise<ActionResult<{ client_id: string; company_name: string }[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('clients')
      .select('client_id, company_name')
      .order('company_name', { ascending: true })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener clientes',
    }
  }
}
