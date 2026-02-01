'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ClientFormModal } from '@/components/clients/client-form-modal'
import { createProject, updateProject } from '@/app/actions/projects'
import { projectSchema, type ProjectFormData } from '@/lib/validations/project.schema'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils'
import type { ProjectWithClient, ProjectStatus, ProjectPriority, Client } from '@/types/database.types'
import { Loader2, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProjectFormProps {
  project?: ProjectWithClient
  clients: { client_id: string; company_name: string }[]
  isEditing?: boolean
}

export function ProjectForm({ project, clients: initialClients, isEditing }: ProjectFormProps) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_name: project?.project_name || '',
      client_id: project?.client_id || '',
      description: project?.description || '',
      status: (project?.status as ProjectStatus) || 'backlog',
      budget: project?.budget || undefined,
      deadline: project?.deadline || undefined,
      priority: (project?.priority as ProjectPriority) || 'medium',
    },
  })

  const selectedStatus = watch('status')
  const selectedPriority = watch('priority')
  const selectedClientId = watch('client_id')

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      console.log('createMutation - sending data:', data)
      const result = await createProject(data)
      console.log('createMutation - result:', result)
      return result
    },
    onSuccess: (result) => {
      console.log('createMutation - onSuccess:', result)
      if (result.success) {
        toast.success('Proyecto creado correctamente')
        router.push('/dashboard/projects')
      } else {
        toast.error(result.error || 'Error al crear proyecto')
      }
    },
    onError: (error) => {
      console.error('createMutation - onError:', error)
      toast.error('Error al crear proyecto')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ProjectFormData) => updateProject(project!.project_id, data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Proyecto actualizado correctamente')
        router.push('/dashboard/projects')
      } else {
        toast.error(result.error || 'Error al actualizar proyecto')
      }
    },
    onError: () => {
      toast.error('Error al actualizar proyecto')
    },
  })

  const onSubmit = (data: ProjectFormData) => {
    console.log('onSubmit - data:', data)
    console.log('onSubmit - isEditing:', isEditing)
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  const handleClientCreated = (newClient: Client) => {
    // Add the new client to the local list and auto-select it
    setClients((prev) => [...prev, { client_id: newClient.client_id, company_name: newClient.company_name }])
    // Use setTimeout to ensure the state has updated before selecting
    setTimeout(() => {
      setValue('client_id', newClient.client_id, { shouldValidate: true, shouldDirty: true })
    }, 0)
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project_name">Nombre del proyecto *</Label>
            <Input
              id="project_name"
              placeholder="Nombre del proyecto"
              {...register('project_name')}
            />
            {errors.project_name && (
              <p className="text-sm text-red-500">{errors.project_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente *</Label>
            <div className="flex gap-2">
              <Select
                value={selectedClientId}
                onValueChange={(value) => setValue('client_id', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {clients.map((client) => (
                    <SelectItem key={client.client_id} value={client.client_id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsClientModalOpen(true)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Crear nuevo cliente</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {errors.client_id && (
              <p className="text-sm text-red-500">{errors.client_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción del proyecto..."
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue('status', value as ProjectStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={selectedPriority}
                onValueChange={(value) => setValue('priority', value as ProjectPriority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto (€)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('budget', { valueAsNumber: true })}
              />
              {errors.budget && (
                <p className="text-sm text-red-500">{errors.budget.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Fecha límite</Label>
              <Input
                id="deadline"
                type="date"
                {...register('deadline')}
              />
              {errors.deadline && (
                <p className="text-sm text-red-500">{errors.deadline.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar cambios' : 'Crear proyecto'}
          </Button>
        </CardFooter>
      </Card>
    </form>

    <ClientFormModal
      open={isClientModalOpen}
      onOpenChange={setIsClientModalOpen}
      onClientCreated={handleClientCreated}
    />
    </>
  )
}
