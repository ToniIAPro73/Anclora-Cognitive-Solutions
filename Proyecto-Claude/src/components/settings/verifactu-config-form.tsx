'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { updateVerifactuConfig } from '@/app/actions/verifactu'
import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'

const verifactuConfigSchema = z.object({
  nif_emisor: z.string().min(1, 'El NIF/CIF es obligatorio').max(20),
  nombre_emisor: z.string().min(1, 'El nombre es obligatorio').max(150),
  entorno: z.enum(['sandbox', 'production']),
  enabled: z.boolean(),
})

type VerifactuConfigFormData = z.infer<typeof verifactuConfigSchema>

interface VerifactuConfigData {
  config_id: string
  nif_emisor: string
  nombre_emisor: string
  entorno: 'sandbox' | 'production'
  enabled: boolean
  software_id: string
  software_version: string
}

interface VerifactuConfigFormProps {
  initialConfig: VerifactuConfigData | null
}

export function VerifactuConfigForm({ initialConfig }: VerifactuConfigFormProps) {
  const queryClient = useQueryClient()
  const [showApiFields, setShowApiFields] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<VerifactuConfigFormData>({
    resolver: zodResolver(verifactuConfigSchema),
    defaultValues: {
      nif_emisor: initialConfig?.nif_emisor || '',
      nombre_emisor: initialConfig?.nombre_emisor || '',
      entorno: initialConfig?.entorno || 'sandbox',
      enabled: initialConfig?.enabled || false,
    },
  })

  const enabled = watch('enabled')
  const entorno = watch('entorno')

  const updateMutation = useMutation({
    mutationFn: updateVerifactuConfig,
    onSuccess: () => {
      toast.success('Configuración guardada correctamente')
      queryClient.invalidateQueries({ queryKey: ['verifactu-config'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (data: VerifactuConfigFormData) => {
    // Serialize to plain object to avoid "Classes or null prototypes" error
    const plainData = {
      nif_emisor: data.nif_emisor,
      nombre_emisor: data.nombre_emisor,
      entorno: data.entorno,
      enabled: data.enabled,
    }
    updateMutation.mutate(plainData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Estado actual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Estado de Verifactu</CardTitle>
              <CardDescription>
                Sistema de facturación electrónica de la Agencia Tributaria
              </CardDescription>
            </div>
            <Badge
              variant={enabled ? 'default' : 'secondary'}
              className={enabled ? 'bg-emerald-500' : ''}
            >
              {enabled ? 'Habilitado' : 'Deshabilitado'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant={enabled ? 'outline' : 'default'}
              onClick={() => setValue('enabled', !enabled, { shouldDirty: true })}
            >
              {enabled ? 'Deshabilitar' : 'Habilitar'} Verifactu
            </Button>
            {enabled && (
              <span className="text-sm text-muted-foreground">
                Las facturas podrán registrarse en Verifactu
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Datos del emisor */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del Emisor</CardTitle>
          <CardDescription>
            Información de tu empresa para el registro de facturas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nif_emisor">NIF/CIF *</Label>
              <Input
                id="nif_emisor"
                placeholder="B12345678"
                {...register('nif_emisor')}
              />
              {errors.nif_emisor && (
                <p className="text-sm text-red-500">{errors.nif_emisor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre_emisor">Razón Social *</Label>
              <Input
                id="nombre_emisor"
                placeholder="Mi Empresa S.L."
                {...register('nombre_emisor')}
              />
              {errors.nombre_emisor && (
                <p className="text-sm text-red-500">{errors.nombre_emisor.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entorno */}
      <Card>
        <CardHeader>
          <CardTitle>Entorno</CardTitle>
          <CardDescription>
            Selecciona el entorno de Verifactu a utilizar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entorno">Entorno</Label>
            <Select
              value={entorno}
              onValueChange={(value: 'sandbox' | 'production') =>
                setValue('entorno', value, { shouldDirty: true })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Sandbox (Pruebas)
                  </div>
                </SelectItem>
                <SelectItem value="production">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Producción
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {entorno === 'sandbox' && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Modo de pruebas activo
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  Las facturas se registrarán en el entorno de pruebas de la AEAT.
                  Los datos no tienen validez fiscal.
                </p>
              </div>
            </div>
          )}

          {entorno === 'production' && (
            <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-emerald-800 dark:text-emerald-200">
                  Modo de producción
                </p>
                <p className="text-emerald-700 dark:text-emerald-300">
                  Las facturas se registrarán oficialmente en la AEAT.
                  Asegúrate de que todos los datos son correctos.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del software */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Software</CardTitle>
          <CardDescription>
            Datos del software de facturación (solo lectura)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-muted-foreground">ID del Software</Label>
              <p className="font-mono text-sm">{initialConfig?.software_id || 'ANCLORA-COG-001'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Versión</Label>
              <p className="font-mono text-sm">{initialConfig?.software_version || '1.0.0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nota informativa */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-800 dark:text-blue-200">
            Simulación de Verifactu
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            Actualmente, el sistema simula el registro en Verifactu generando datos localmente
            (hash, CSV, QR). Cuando la API real de Verifactu esté disponible, se integrará
            automáticamente sin cambios en tu configuración.
          </p>
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
          {updateMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
