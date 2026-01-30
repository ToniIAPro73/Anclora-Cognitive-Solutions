'use server'

import { createClient } from '@/lib/supabase/server'
import { projectSchema, type ProjectFormValues, isTransitionAllowed } from '@/lib/validations/project.schema'
import { revalidatePath } from 'next/cache'

export async function createProjectAction(values: ProjectFormValues) {
  const validatedFields = projectSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Campos inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('projects').insert([validatedFields.data])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/kanban')
  return { success: true }
}

export async function updateProjectAction(id: string, values: ProjectFormValues) {
  const validatedFields = projectSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Campos inválidos' }
  }

  // Check current status for transition validation
  const supabase = await createClient()
  const { data: currentProject } = await supabase
    .from('projects')
    .select('status')
    .eq('project_id', id)
    .single()

  if (currentProject && !isTransitionAllowed(currentProject.status, validatedFields.data.status)) {
    return { error: `Transición de estado no permitida: ${currentProject.status} -> ${validatedFields.data.status}` }
  }

  const { error } = await supabase
    .from('projects')
    .update({ ...validatedFields.data, status: validatedFields.data.status as any })
    .eq('project_id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/kanban')
  return { success: true }
}

export async function archiveProjectAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('projects')
    .update({ archived: true })
    .eq('project_id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/kanban')
  return { success: true }
}

export async function deleteProjectAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('project_id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/kanban')
  return { success: true }
}
