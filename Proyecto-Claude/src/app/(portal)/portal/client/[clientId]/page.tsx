'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { ProjectWithClient, QuoteWithProject, InvoiceWithProject } from '@/types/database.types'
import {
  FolderKanban,
  FileText,
  Receipt,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'

interface ClientDashboardProps {
  params: { clientId: string }
}

interface DashboardData {
  projectsCount: number
  activeProjectsCount: number
  completedProjectsCount: number
  pendingQuotesCount: number
  pendingInvoicesTotal: number
  recentProjects: ProjectWithClient[]
  recentQuotes: QuoteWithProject[]
  overdueInvoices: InvoiceWithProject[]
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
  backlog: 'Pendiente',
  proposal: 'Propuesta',
  approved: 'Aprobado',
  in_progress: 'En progreso',
  testing: 'En revisión',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const PROJECT_STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-slate-500',
  proposal: 'bg-amber-500',
  approved: 'bg-blue-500',
  in_progress: 'bg-indigo-500',
  testing: 'bg-purple-500',
  completed: 'bg-green-600',
  cancelled: 'bg-gray-500',
}

export default function ClientDashboardPage({ params }: ClientDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient()

      // Get projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*, clients(*)')
        .eq('client_id', params.clientId)
        .eq('archived', false)
        .order('updated_at', { ascending: false })

      // Get quotes
      const { data: quotes } = await supabase
        .from('quotes')
        .select('*, projects(*, clients(*))')
        .eq('projects.client_id', params.clientId)
        .in('status', ['sent', 'viewed'])
        .order('created_at', { ascending: false })
        .limit(5)

      // Get invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*, projects(*, clients(*))')
        .eq('projects.client_id', params.clientId)
        .order('created_at', { ascending: false })

      const projectsList = (projects || []) as ProjectWithClient[]
      const quotesList = (quotes || []) as QuoteWithProject[]
      const invoicesList = (invoices || []) as InvoiceWithProject[]

      const activeStatuses = ['proposal', 'approved', 'in_progress', 'testing']
      const activeProjects = projectsList.filter(p => activeStatuses.includes(p.status))
      const completedProjects = projectsList.filter(p => p.status === 'completed')

      const pendingInvoices = invoicesList.filter(i => i.status === 'sent' || i.status === 'overdue')
      const overdueInvoices = invoicesList.filter(i => i.status === 'overdue')

      setData({
        projectsCount: projectsList.length,
        activeProjectsCount: activeProjects.length,
        completedProjectsCount: completedProjects.length,
        pendingQuotesCount: quotesList.length,
        pendingInvoicesTotal: pendingInvoices.reduce((sum, i) => sum + i.total, 0),
        recentProjects: projectsList.slice(0, 3),
        recentQuotes: quotesList.slice(0, 3),
        overdueInvoices: overdueInvoices.slice(0, 3),
      })
      setIsLoading(false)
    }

    loadDashboard()
  }, [params.clientId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Bienvenido a tu portal</h1>
        <p className="text-muted-foreground">
          Aquí puedes ver el estado de tus proyectos, presupuestos y facturas.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <FolderKanban className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.activeProjectsCount}</p>
                <p className="text-sm text-muted-foreground">Proyectos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.completedProjectsCount}</p>
                <p className="text-sm text-muted-foreground">Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.pendingQuotesCount}</p>
                <p className="text-sm text-muted-foreground">Presupuestos pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(data.pendingInvoicesTotal)}</p>
                <p className="text-sm text-muted-foreground">Por facturar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Invoices Alert */}
      {data.overdueInvoices.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">
                  Tienes {data.overdueInvoices.length} factura(s) vencida(s)
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Por favor, regulariza los pagos pendientes lo antes posible.
                </p>
                <div className="mt-3 space-y-2">
                  {data.overdueInvoices.map((invoice) => (
                    <div key={invoice.invoice_id} className="flex items-center justify-between text-sm">
                      <span className="text-red-800">{invoice.invoice_number}</span>
                      <span className="font-medium text-red-800">{formatCurrency(invoice.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Proyectos recientes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/portal/client/${params.clientId}/kanban`}>
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {data.recentProjects.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay proyectos aún
            </p>
          ) : (
            <div className="space-y-4">
              {data.recentProjects.map((project) => (
                <div
                  key={project.project_id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h4 className="font-medium">{project.project_name}</h4>
                    {project.deadline && (
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="mr-1 h-3 w-3" />
                        Entrega: {formatDate(project.deadline)}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn('text-white border-0', PROJECT_STATUS_COLORS[project.status])}
                  >
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Quotes */}
      {data.recentQuotes.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Presupuestos pendientes de respuesta</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/portal/client/${params.clientId}/quotes`}>
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentQuotes.map((quote) => (
                <div
                  key={quote.quote_id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h4 className="font-medium">{quote.projects?.project_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Versión {quote.version} • {formatDate(quote.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(quote.total)}</p>
                    <Badge variant="outline" className="mt-1">
                      {quote.status === 'sent' ? 'Enviado' : 'Visto'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
