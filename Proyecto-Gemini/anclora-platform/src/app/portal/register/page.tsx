'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientRegisterSchema, type ClientRegisterFormValues } from '@/lib/validations/auth.schema'
import { signUpClient } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function ClientRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientRegisterFormValues>({
    resolver: zodResolver(clientRegisterSchema),
  })

  const onSubmit = async (data: ClientRegisterFormValues) => {
    setIsLoading(true)
    const result = await signUpClient(data)
    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success || '¡Registro completado!')
      setIsSent(true)
    }
  }

  if (isSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
        <Card className="w-full max-w-md text-center border-t-4 border-teal-600 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Registro Exitoso</CardTitle>
            <CardDescription>
              Hemos creado tu ficha de cliente y enviado un enlace mágico a tu email. Haz click en él para acceder.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button variant="outline">Volver al Inicio</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md border-t-4 border-teal-600 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Alta de Cliente</CardTitle>
          <CardDescription className="text-center">
            Regístrate para ver el estado de tus proyectos de IA
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Nombre de la Empresa</Label>
              <Input
                id="companyName"
                placeholder="Empresa S.L."
                {...register('companyName')}
                className={errors.companyName ? 'border-red-500' : ''}
              />
              {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Persona de Contacto</Label>
              <Input
                id="fullName"
                placeholder="Tu nombre completo"
                {...register('fullName')}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@empresa.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 h-11" type="submit" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Solicitar Acceso'}
            </Button>
            <p className="text-center text-sm text-slate-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/portal/login" className="text-teal-600 font-semibold hover:underline">
                Entra aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
