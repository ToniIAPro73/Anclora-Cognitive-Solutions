'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

const alertTypes = [
  { value: 'deadline_approaching', label: 'Fecha límite próxima' },
  { value: 'budget_exceeded', label: 'Presupuesto excedido' },
  { value: 'invoice_overdue', label: 'Factura vencida' },
  { value: 'project_stale', label: 'Proyecto inactivo' },
  { value: 'client_inactive', label: 'Cliente inactivo' },
] as const

const alertPriorities = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
] as const

const alertSchema = z.object({
  type: z.enum(['deadline_approaching', 'budget_exceeded', 'invoice_overdue', 'project_stale', 'client_inactive']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  message: z.string().min(5, 'El mensaje debe tener al menos 5 caracteres'),
})

type AlertFormData = z.infer<typeof alertSchema>

export function AlertFormModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      type: 'deadline_approaching',
      priority: 'medium',
      message: '',
    },
  })

  const onSubmit = async (data: AlertFormData) => {
    setIsLoading(true)

    const { error } = await supabase
      .from('alerts')
      .insert({
        type: data.type,
        priority: data.priority,
        message: data.message,
        is_read: false,
      })

    if (error) {
      toast.error('Error al crear la alerta')
      setIsLoading(false)
      return
    }

    toast.success('Alerta creada correctamente')
    queryClient.invalidateQueries({ queryKey: ['alerts'] })
    queryClient.invalidateQueries({ queryKey: ['unread-alerts-count'] })
    reset()
    setIsOpen(false)
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Alerta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Alerta</DialogTitle>
          <DialogDescription>
            Crea una alerta manual para el sistema
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de alerta</Label>
              <Select
                defaultValue="deadline_approaching"
                onValueChange={(value) => setValue('type', value as AlertFormData['type'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {alertTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                defaultValue="medium"
                onValueChange={(value) => setValue('priority', value as AlertFormData['priority'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {alertPriorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Describe la alerta..."
                rows={3}
                {...register('message')}
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Alerta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
