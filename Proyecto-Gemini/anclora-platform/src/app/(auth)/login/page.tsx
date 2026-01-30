'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth.schema'
import { signIn } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bot, ChevronLeft } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    const result = await signIn(data)
    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Sesión iniciada correctamente')
      router.push('/dashboard')
    }
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
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Anclora <span className="text-primary">Cognitive</span></h1>
        </div>

        <Card className="border-border shadow-2xl bg-card border shadow-primary/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
            <CardDescription className="text-center">
              Gestiona proyectos, clientes y presupuestos con IA
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@anclora.com"
                  {...register('email')}
                  className={cn("bg-muted/30 border-border focus-visible:ring-primary h-11", errors.email && 'border-destructive')}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  {...register('password')}
                  className={cn("bg-muted/30 border-border focus-visible:ring-primary h-11", errors.password && 'border-destructive')}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 pt-2">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-bold shadow-lg shadow-primary/10 transition-all active:scale-95" type="submit" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="text-primary font-bold hover:underline">
                  Regístrate
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'
