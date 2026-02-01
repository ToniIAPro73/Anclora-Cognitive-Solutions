'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { projectSchema, type ProjectFormData, type ProjectFilterParams } from '@/lib/validations/project.schema'
import { canTransitionTo } from '@/lib/utils'
import type { Project, ProjectWithClient, ProjectWithClientSummary, ProjectStatus } from '@/types/database.types'
import { ZodError } from 'zod'

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export async function getProjects(params?: ProjectFilterParams): Promise<ActionResult<ProjectWithClientSummary[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('projects')
      .select('*, clients(company_name, email)')

    if (params?.search) {
      query = query.ilike('project_name', `%${params.search}%`)
    }

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }

    if (params?.client_id) {
      query = query.eq('client_id', params.client_id)
    }

    if (params?.priority && params.priority !== 'all') {
      query = query.eq('priority', params.priority)
    }

    if (params?.archived !== undefined) {
      query = query.eq('archived', params.archived)
    } else {
      query = query.eq('archived', false)
    }

    query = query.order('updated_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener proyectos',
    }
  }
}

export const getProject = getProjectById

export async function getProjectById(projectId: string): Promise<ActionResult<ProjectWithClient>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      .select('*, clients(*)')
      .eq('project_id', projectId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener proyecto',
    }
  }
}

export async function getProjectsForKanban(): Promise<ActionResult<Record<ProjectStatus, ProjectWithClient[]>>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      .select('*, clients(company_name, email)')
      .eq('archived', false)
      .order('priority', { ascending: false })
      .order('deadline', { ascending: true, nullsFirst: false })

    if (error) throw error

    const grouped: Record<ProjectStatus, ProjectWithClient[]> = {
      backlog: [],
      proposal: [],
      approved: [],
      in_progress: [],
      testing: [],
      completed: [],
      cancelled: [],
    }

    for (const project of (data || []) as ProjectWithClient[]) {
      if (grouped[project.status]) {
        grouped[project.status].push(project)
      }
    }

    return { success: true, data: grouped }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener proyectos',
    }
  }
}

export async function createProject(formData: ProjectFormData): Promise<ActionResult<Project>> {
  try {
    const validatedData = projectSchema.parse(formData)
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      // @ts-ignore - Supabase types issue with custom schema
      .insert({
        project_name: validatedData.project_name,
        client_id: validatedData.client_id,
        description: validatedData.description || null,
        status: validatedData.status,
        budget: validatedData.budget || null,
        deadline: validatedData.deadline || null,
        priority: validatedData.priority,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/kanban')
    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: firstError?.message || 'Error de validación',
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear proyecto',
    }
  }
}

export async function updateProject(projectId: string, formData: Partial<ProjectFormData>): Promise<ActionResult<Project>> {
  try {
    const supabase = await createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}

    if (formData.project_name !== undefined) updateData.project_name = formData.project_name
    if (formData.description !== undefined) updateData.description = formData.description
    if (formData.status !== undefined) updateData.status = formData.status
    if (formData.budget !== undefined) updateData.budget = formData.budget
    if (formData.deadline !== undefined) updateData.deadline = formData.deadline
    if (formData.priority !== undefined) updateData.priority = formData.priority

    const { data, error } = await supabase
      .from('projects')
      // @ts-ignore - Supabase types issue with custom schema
      .update(updateData)
      .eq('project_id', projectId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/kanban')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar proyecto',
    }
  }
}

export async function updateProjectStatus(projectId: string, newStatus: ProjectStatus): Promise<ActionResult<Project>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current status
    const { data: current, error: fetchError } = await supabase
      .from('projects')
      .select('status')
      .eq('project_id', projectId)
      .single()

    if (fetchError) throw fetchError

    // Validate transition
    // @ts-ignore - Supabase types issue with custom schema
    if (!canTransitionTo(current.status, newStatus)) {
      return {
        success: false,
        // @ts-ignore - Supabase types issue with custom schema
        error: `No se puede cambiar de "${current.status}" a "${newStatus}"`,
      }
    }

    const { data, error } = await supabase
      .from('projects')
      // @ts-ignore - Supabase types issue with custom schema
      .update({ status: newStatus })
      .eq('project_id', projectId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/kanban')
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar estado',
    }
  }
}

export async function archiveProject(projectId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('projects')
      // @ts-ignore - Supabase types issue with custom schema
      .update({ archived: true })
      .eq('project_id', projectId)

    if (error) throw error

    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/kanban')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al archivar proyecto',
    }
  }
}

export async function unarchiveProject(projectId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('projects')
      // @ts-ignore - Supabase types issue with custom schema
      .update({ archived: false })
      .eq('project_id', projectId)

    if (error) throw error

    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/kanban')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al desarchivar proyecto',
    }
  }
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('project_id', projectId)

    if (error) throw error

    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/kanban')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar proyecto',
    }
  }
}
