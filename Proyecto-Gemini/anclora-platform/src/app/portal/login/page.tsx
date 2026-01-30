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
import Link from 'next/link'
import { Bot, ChevronLeft, MailCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden text-center">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
         
        <Card className="w-full max-w-md border-border shadow-2xl bg-card">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <MailCheck className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Enlace enviado</CardTitle>
              <CardDescription className="text-base">
                Hemos enviado un enlace mágico a tu email personal. Haz click en el enlace para entrar directamente.
              </CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="flex justify-center pb-8 pt-4">
            <Button variant="outline" size="lg" className="rounded-xl px-8" onClick={() => setIsSent(false)}>Volver a intentar</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Volver al inicio</span>
      </Link>

      <div className="w-full max-w-md space-y-8 relative">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 text-primary-foreground">
            <Bot className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Anclora <span className="text-primary">Cognitive</span></h1>
        </div>

        <Card className="border-border shadow-2xl bg-card border shadow-primary/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Portal Cliente</CardTitle>
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
                  className={cn("bg-muted/30 border-border focus-visible:ring-primary h-11", errors.email && 'border-destructive')}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 pt-2">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-bold shadow-lg shadow-primary/10 transition-all active:scale-95" type="submit" disabled={isLoading}>
                {isLoading ? 'Enviando enlace...' : 'Enviar enlace de acceso'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ¿No estás registrado?{' '}
                <Link href="/portal/register" className="text-primary font-bold hover:underline">
                  Darse de alta
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
