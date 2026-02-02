import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileCheck, Building, Mail, Shield } from 'lucide-react'

const settingsItems = [
  {
    title: 'Verifactu',
    description: 'Configuración de facturación electrónica (AEAT)',
    href: '/dashboard/settings/verifactu',
    icon: FileCheck,
  },
  {
    title: 'Empresa',
    description: 'Datos de tu empresa para facturas y presupuestos',
    href: '/dashboard/settings/company',
    icon: Building,
    disabled: true,
  },
  {
    title: 'Email',
    description: 'Configuración de envío de correos',
    href: '/dashboard/settings/email',
    icon: Mail,
    disabled: true,
  },
  {
    title: 'Seguridad',
    description: 'Contraseña y autenticación',
    href: '/dashboard/settings/security',
    icon: Shield,
    disabled: true,
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu cuenta y aplicación
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsItems.map((item) => {
          const content = (
            <Card
              className={item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 transition-colors cursor-pointer'}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              {item.disabled && (
                <CardContent>
                  <span className="text-xs text-muted-foreground">Próximamente</span>
                </CardContent>
              )}
            </Card>
          )

          if (item.disabled) {
            return <div key={item.title}>{content}</div>
          }

          return (
            <Link key={item.title} href={item.href}>
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
