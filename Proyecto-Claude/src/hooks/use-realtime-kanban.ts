'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { STATUS_LABELS } from '@/lib/utils'
import type { ProjectStatus, ProjectWithClient } from '@/types/database.types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

interface ProjectPayload {
  project_id: string
  project_name: string
  status: ProjectStatus
  client_id: string
}

interface UseRealtimeKanbanOptions {
  enabled?: boolean
  showNotifications?: boolean
}

export function useRealtimeKanban(options: UseRealtimeKanbanOptions = {}) {
  const { enabled = true, showNotifications = true } = options
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Track pending mutations to avoid showing notifications for own changes
  const pendingMutationsRef = useRef<Set<string>>(new Set())

  const addPendingMutation = useCallback((projectId: string) => {
    pendingMutationsRef.current.add(projectId)
    // Auto-clear after 5 seconds as fallback
    setTimeout(() => {
      pendingMutationsRef.current.delete(projectId)
    }, 5000)
  }, [])

  const removePendingMutation = useCallback((projectId: string) => {
    pendingMutationsRef.current.delete(projectId)
  }, [])

  const isPendingMutation = useCallback((projectId: string) => {
    return pendingMutationsRef.current.has(projectId)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel('kanban-realtime')
      .on<ProjectPayload>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'anclora',
          table: 'projects',
        },
        (payload: RealtimePostgresChangesPayload<ProjectPayload>) => {
          const newProject = payload.new as ProjectPayload

          if (isPendingMutation(newProject.project_id)) {
            removePendingMutation(newProject.project_id)
            return
          }

          // Refetch data
          queryClient.invalidateQueries({ queryKey: ['kanban-projects'] })

          if (showNotifications) {
            toast(`Nuevo proyecto creado: "${newProject.project_name}"`, {
              icon: '📋',
              duration: 3000,
            })
          }
        }
      )
      .on<ProjectPayload>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'anclora',
          table: 'projects',
        },
        (payload: RealtimePostgresChangesPayload<ProjectPayload>) => {
          const oldProject = payload.old as ProjectPayload
          const newProject = payload.new as ProjectPayload

          if (isPendingMutation(newProject.project_id)) {
            removePendingMutation(newProject.project_id)
            return
          }

          // Optimistically update the cache
          const currentData = queryClient.getQueryData<Record<ProjectStatus, ProjectWithClient[]>>(['kanban-projects'])

          if (currentData && oldProject.status !== newProject.status) {
            const updatedData = { ...currentData }

            // Find and remove from old column
            const oldColumnProjects = [...(updatedData[oldProject.status] || [])]
            const projectIndex = oldColumnProjects.findIndex(p => p.project_id === newProject.project_id)

            if (projectIndex !== -1) {
              const [movedProject] = oldColumnProjects.splice(projectIndex, 1)
              updatedData[oldProject.status] = oldColumnProjects

              // Add to new column
              const newColumnProjects = [...(updatedData[newProject.status] || [])]
              newColumnProjects.push({
                ...movedProject,
                status: newProject.status,
              })
              updatedData[newProject.status] = newColumnProjects

              queryClient.setQueryData(['kanban-projects'], updatedData)
            }
          }

          // Also refetch to ensure consistency
          queryClient.invalidateQueries({ queryKey: ['kanban-projects'] })

          // Show notification only for status changes
          if (showNotifications && oldProject.status !== newProject.status) {
            toast(
              `Proyecto "${newProject.project_name}" movido a ${STATUS_LABELS[newProject.status]}`,
              {
                icon: '🔄',
                duration: 3000,
              }
            )
          }
        }
      )
      .on<ProjectPayload>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'anclora',
          table: 'projects',
        },
        (payload: RealtimePostgresChangesPayload<ProjectPayload>) => {
          const deletedProject = payload.old as ProjectPayload

          if (isPendingMutation(deletedProject.project_id)) {
            removePendingMutation(deletedProject.project_id)
            return
          }

          // Remove from cache
          const currentData = queryClient.getQueryData<Record<ProjectStatus, ProjectWithClient[]>>(['kanban-projects'])

          if (currentData) {
            const updatedData = { ...currentData }
            for (const status of Object.keys(updatedData) as ProjectStatus[]) {
              updatedData[status] = updatedData[status].filter(
                p => p.project_id !== deletedProject.project_id
              )
            }
            queryClient.setQueryData(['kanban-projects'], updatedData)
          }

          queryClient.invalidateQueries({ queryKey: ['kanban-projects'] })

          if (showNotifications) {
            toast(`Proyecto eliminado: "${deletedProject.project_name}"`, {
              icon: '🗑️',
              duration: 3000,
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime Kanban: Connected')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime Kanban: Connection error')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, showNotifications, supabase, queryClient, isPendingMutation, removePendingMutation])

  return {
    addPendingMutation,
    removePendingMutation,
  }
}
