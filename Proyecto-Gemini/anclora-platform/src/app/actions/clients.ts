'use server'

import { createClient } from '@/lib/supabase/server'
import { clientSchema, type ClientFormValues } from '@/lib/validations/client.schema'
import { revalidatePath } from 'next/cache'

export async function createClientAction(values: ClientFormValues) {
  const validatedFields = clientSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Campos inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('clients').insert([validatedFields.data])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/clients')
  return { success: true }
}

export async function updateClientAction(id: string, values: ClientFormValues) {
  const validatedFields = clientSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Campos inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .update(validatedFields.data)
    .eq('client_id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/clients')
  return { success: true }
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()

  // Check for active projects first
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('project_id')
    .eq('client_id', id)
    .not('status', 'eq', 'cancelled')
    .eq('archived', false)

  if (projects && projects.length > 0) {
    return { error: 'No se puede eliminar un cliente con proyectos activos.' }
  }

  const { error } = await supabase.from('clients').delete().eq('client_id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/clients')
  return { success: true }
}
