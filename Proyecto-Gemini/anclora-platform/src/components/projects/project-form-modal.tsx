'use client'

import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectFormValues } from '@/lib/validations/project.schema'
import { createProjectAction, updateProjectAction } from '@/app/actions/projects'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: ProjectFormValues & { project_id: string }
}

export function ProjectFormModal({ isOpen, onClose, initialData }: ProjectFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from('clients').select('client_id, company_name').order('company_name')
      if (data) setClients(data)
    }
    if (isOpen) fetchClients()
  }, [isOpen, supabase])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: initialData || {
      status: 'backlog',
      priority: 'medium',
    },
  })

  // Set default client if not editing and only one client exists
  useEffect(() => {
    if (!initialData && clients.length === 1) {
      setValue('client_id', clients[0].client_id)
    }
  }, [clients, initialData, setValue])

  const onSubmit: SubmitHandler<ProjectFormValues> = async (data) => {
    setIsLoading(true)
    let result
    if (initialData) {
      result = await updateProjectAction(initialData.project_id, data)
    } else {
      result = await createProjectAction(data)
    }
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(initialData ? 'Proyecto actualizado' : 'Proyecto creado')
      reset()
      onClose()
    }
  }

  const currentStatus = watch('status')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Gestiona el progreso y detalles del proyecto.' : 'Crea un nuevo proyecto para un cliente.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_name">Nombre del Proyecto</Label>
              <Input id="project_name" {...register('project_name')} placeholder="Ej. Rediseño Web" />
              {errors.project_name && <p className="text-xs text-red-500">{errors.project_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                onValueChange={(value) => setValue('client_id', value as string)}
                defaultValue={watch('client_id')}
                disabled={!!initialData} // Don't allow changing client for existing projects
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.client_id} value={client.client_id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && <p className="text-xs text-red-500">{errors.client_id.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                onValueChange={(value) => setValue('status', value as any)}
                defaultValue={currentStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="proposal">Presupuesto</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="in_progress">En curso</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                onValueChange={(value) => setValue('priority', value as any)}
                defaultValue={watch('priority')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto (Base Imponible)</Label>
              <Input id="budget" type="number" step="0.01" {...register('budget')} placeholder="0.00" />
              {errors.budget && <p className="text-xs text-red-500">{errors.budget.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Fecha Límite</Label>
              <Input id="deadline" type="date" {...register('deadline')} />
              {errors.deadline && <p className="text-xs text-red-500">{errors.deadline.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...register('description')} placeholder="Detalles del proyecto..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-teal-600" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Proyecto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
