import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VerifactuConfigForm } from '@/components/settings/verifactu-config-form'
import { getVerifactuConfig } from '@/app/actions/verifactu'

export default async function VerifactuSettingsPage() {
  const result = await getVerifactuConfig()

  // Serialize config to plain object to avoid "Classes or null prototypes" error
  const config = result.success && result.data
    ? {
        config_id: result.data.config_id,
        nif_emisor: result.data.nif_emisor,
        nombre_emisor: result.data.nombre_emisor,
        entorno: result.data.entorno,
        enabled: result.data.enabled,
        software_id: result.data.software_id,
        software_version: result.data.software_version,
      }
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verifactu</h1>
          <p className="text-muted-foreground">
            Configuración de facturación electrónica para la AEAT
          </p>
        </div>
      </div>

      <VerifactuConfigForm initialConfig={config} />
    </div>
  )
}
