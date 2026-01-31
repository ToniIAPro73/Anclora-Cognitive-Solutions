'use client'

import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { KanbanColumn } from './kanban-column'
import { getProjectsForKanban, updateProjectStatus } from '@/app/actions/projects'
import { STATUS_LABELS, canTransitionTo } from '@/lib/utils'
import { useRealtimeKanban } from '@/hooks/use-realtime-kanban'
import type { ProjectWithClient, ProjectStatus } from '@/types/database.types'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const COLUMN_ORDER: ProjectStatus[] = [
  'backlog',
  'proposal',
  'approved',
  'in_progress',
  'testing',
  'completed',
  'cancelled',
]

const COLUMN_COLORS: Record<ProjectStatus, string> = {
  backlog: 'bg-slate-500',
  proposal: 'bg-amber-500',
  approved: 'bg-emerald-500',
  in_progress: 'bg-blue-500',
  testing: 'bg-purple-500',
  completed: 'bg-green-600',
  cancelled: 'bg-red-500',
}

export function KanbanBoard() {
  const queryClient = useQueryClient()
  const { addPendingMutation, removePendingMutation } = useRealtimeKanban({
    enabled: true,
    showNotifications: true,
  })

  const { data: columns, isLoading } = useQuery({
    queryKey: ['kanban-projects'],
    queryFn: async () => {
      const result = await getProjectsForKanban()
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ projectId, newStatus }: { projectId: string; newStatus: ProjectStatus }) => {
      const result = await updateProjectStatus(projectId, newStatus)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onMutate: async ({ projectId, newStatus }) => {
      // Mark as pending to avoid duplicate notifications from realtime
      addPendingMutation(projectId)

      await queryClient.cancelQueries({ queryKey: ['kanban-projects'] })

      const previousData = queryClient.getQueryData<Record<ProjectStatus, ProjectWithClient[]>>(['kanban-projects'])

      if (previousData) {
        const newData = { ...previousData }
        let movedProject: ProjectWithClient | undefined

        for (const status of COLUMN_ORDER) {
          const index = newData[status].findIndex(p => p.project_id === projectId)
          if (index !== -1) {
            movedProject = { ...newData[status][index], status: newStatus }
            newData[status] = [...newData[status].slice(0, index), ...newData[status].slice(index + 1)]
            break
          }
        }

        if (movedProject) {
          newData[newStatus] = [...newData[newStatus], movedProject]
        }

        queryClient.setQueryData(['kanban-projects'], newData)
      }

      return { previousData }
    },
    onError: (error, variables, context) => {
      removePendingMutation(variables.projectId)
      if (context?.previousData) {
        queryClient.setQueryData(['kanban-projects'], context.previousData)
      }
      toast.error(error.message)
    },
    onSuccess: (_, variables) => {
      removePendingMutation(variables.projectId)
      toast.success('Proyecto actualizado')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-projects'] })
    },
  })

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const newStatus = destination.droppableId as ProjectStatus
    const currentStatus = source.droppableId as ProjectStatus

    if (!canTransitionTo(currentStatus, newStatus)) {
      toast.error(`No se puede mover de "${STATUS_LABELS[currentStatus]}" a "${STATUS_LABELS[newStatus]}"`)
      return
    }

    updateStatusMutation.mutate({
      projectId: draggableId,
      newStatus,
    })
  }

  if (isLoading || !columns) {
    return null
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-6 pb-8">
        {COLUMN_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            title={STATUS_LABELS[status]}
            color={COLUMN_COLORS[status]}
            projects={columns[status]}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
