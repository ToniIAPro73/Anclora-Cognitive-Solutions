'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { createClient, updateClient } from '@/app/actions/clients'
import { clientSchema, type ClientFormData } from '@/lib/validations/client.schema'
import type { Client } from '@/types/database.types'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

interface ClientFormModalProps {
  client?: Client
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ClientFormModal({ client, open, onOpenChange }: ClientFormModalProps) {
  const [isOpen, setIsOpen] = useState(open || false)
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const isControlled = open !== undefined && onOpenChange !== undefined
  const dialogOpen = isControlled ? open : isOpen
  const setDialogOpen = isControlled ? onOpenChange : setIsOpen

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? {
          company_name: client.company_name,
          email: client.email,
          contact_person: client.contact_person || '',
          phone: client.phone || '',
          address: client.address || '',
          nif_cif: client.nif_cif || '',
          preferred_language: client.preferred_language,
          notes: client.notes || '',
        }
      : {
          preferred_language: 'es',
        },
  })

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true)

    const result = client?.client_id
      ? await updateClient(client.client_id, data)
      : await createClient(data)

    if (!result.success) {
      toast.error(result.error || 'Error al guardar cliente')
      setIsLoading(false)
      return
    }

    toast.success(client?.client_id ? 'Cliente actualizado' : 'Cliente creado')
    queryClient.invalidateQueries({ queryKey: ['clients'] })
    reset()
    setDialogOpen(false)
    setIsLoading(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset()
    }
    setDialogOpen(open)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="accent">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client?.client_id ? 'Editar cliente' : 'Nuevo cliente'}
          </DialogTitle>
          <DialogDescription>
            {client?.client_id
              ? 'Modifica los datos del cliente'
              : 'Añade un nuevo cliente a tu cartera'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nombre de empresa *</Label>
            <Input
              id="company_name"
              placeholder="Empresa S.L."
              {...register('company_name')}
            />
            {errors.company_name && (
              <p className="text-sm text-destructive">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="contacto@empresa.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Persona de contacto</Label>
              <Input
                id="contact_person"
                placeholder="Juan García"
                {...register('contact_person')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+34612345678"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nif_cif">NIF/CIF</Label>
              <Input
                id="nif_cif"
                placeholder="B12345678"
                {...register('nif_cif')}
              />
              {errors.nif_cif && (
                <p className="text-sm text-destructive">{errors.nif_cif.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_language">Idioma preferido</Label>
              <Select
                value={watch('preferred_language')}
                onValueChange={(value) =>
                  setValue('preferred_language', value as 'es' | 'en' | 'ca')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ca">Català</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              placeholder="C/ Ejemplo 123, 28001 Madrid"
              {...register('address')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas internas</Label>
            <Textarea
              id="notes"
              placeholder="Notas que solo verás tú..."
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              {client?.client_id ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
