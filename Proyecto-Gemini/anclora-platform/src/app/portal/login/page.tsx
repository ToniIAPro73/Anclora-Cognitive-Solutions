'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { magicLinkSchema, type MagicLinkFormValues } from '@/lib/validations/auth.schema'
import { signInWithMagicLink } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

export default function ClientLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
  })

  const onSubmit = async (data: MagicLinkFormValues) => {
    setIsLoading(true)
    const result = await signInWithMagicLink(data)
    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('¡Revisa tu bandeja de entrada!')
      setIsSent(true)
    }
  }

  if (isSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Enlace enviado</CardTitle>
            <CardDescription>
              Hemos enviado un enlace mágico a tu email personal. Haz click en el enlace para entrar directamente.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => setIsSent(false)}>Volver a intentar</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Portal Cliente - Anclora</CardTitle>
          <CardDescription className="text-center">
            Introduce tu email para recibir un enlace de acceso directo
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email registrado</Label>
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
          <CardFooter>
            <Button className="w-full bg-teal-600 hover:bg-teal-700" type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando enlace...' : 'Enviar enlace de acceso'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
