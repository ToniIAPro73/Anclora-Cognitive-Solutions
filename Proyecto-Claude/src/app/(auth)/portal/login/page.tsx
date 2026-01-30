'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Mail, CheckCircle } from 'lucide-react'

const magicLinkSchema = z.object({
  email: z.string().email('Email inválido'),
})

type MagicLinkFormData = z.infer<typeof magicLinkSchema>

export default function PortalLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
  })

  const onSubmit = async (data: MagicLinkFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    // Check if email exists in clients table
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('client_id')
      .eq('email', data.email)
      .single<{ client_id: string }>()

    if (clientError || !clientData) {
      toast.error('Este email no está registrado como cliente')
      setIsLoading(false)
      return
    }

    const clientId = clientData.client_id

    // Send magic link
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/portal/client/${clientId}`,
      },
    })

    if (error) {
      toast.error('Error al enviar el enlace de acceso')
      setIsLoading(false)
      return
    }

    setSentEmail(data.email)
    setEmailSent(true)
    setIsLoading(false)
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <CardTitle>Revisa tu email</CardTitle>
            <CardDescription>
              Hemos enviado un enlace de acceso a <strong>{sentEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              El enlace expirará en 1 hora. Si no lo encuentras, revisa tu carpeta de spam.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setEmailSent(false)}
            >
              Usar otro email
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xl font-bold">
            A
          </div>
          <CardTitle className="text-2xl">Portal Cliente</CardTitle>
          <CardDescription>
            Ingresa tu email para recibir un enlace de acceso seguro
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  className="pl-9"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" loading={isLoading}>
              Enviar enlace de acceso
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿Eres administrador?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Accede aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
