'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormValues } from '@/lib/validations/client.schema'
import { createClientAction, updateClientAction } from '@/app/actions/clients'
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

interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: ClientFormValues & { client_id: string }
}

export function ClientFormModal({ isOpen, onClose, initialData }: ClientFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: initialData || {
      preferred_language: 'es',
    },
  })

  const onSubmit: SubmitHandler<ClientFormValues> = async (data) => {
    setIsLoading(true)
    let result
    if (initialData) {
      result = await updateClientAction(initialData.client_id, data)
    } else {
      result = await createClientAction(data)
    }
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(initialData ? 'Cliente actualizado' : 'Cliente creado')
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Actualiza la información de tu cliente.' : 'Añade un nuevo cliente a la plataforma.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de Empresa</Label>
              <Input id="company_name" {...register('company_name')} placeholder="Ej. Anclora SA" />
              {errors.company_name && <p className="text-xs text-red-500">{errors.company_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email de Contacto</Label>
              <Input id="email" type="email" {...register('email')} placeholder="email@empresa.com" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Persona de Contacto</Label>
              <Input id="contact_person" {...register('contact_person')} placeholder="Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (E.164)</Label>
              <Input id="phone" {...register('phone')} placeholder="+34600112233" />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nif_cif">NIF / CIF</Label>
              <Input id="nif_cif" {...register('nif_cif')} placeholder="12345678A" />
              {errors.nif_cif && <p className="text-xs text-red-500">{errors.nif_cif.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Idioma Preferido</Label>
              <Select
                onValueChange={(value) => setValue('preferred_language', value as any)}
                defaultValue={watch('preferred_language')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">Inglés</SelectItem>
                  <SelectItem value="ca">Catalán</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea id="address" {...register('address')} placeholder="Calle Ejemplo 123" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Internas</Label>
            <Textarea id="notes" {...register('notes')} placeholder="Anotaciones solo para admin" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-teal-600" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
