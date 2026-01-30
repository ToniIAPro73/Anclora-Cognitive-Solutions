import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FolderKanban, FileText, Receipt, AlertTriangle, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

async function getStats() {
  const supabase = await createServerSupabaseClient()

  const [clients, projects, quotes, invoices, alerts] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('archived', false),
    supabase.from('quotes').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('total').eq('status', 'paid').returns<{ total: number }[]>(),
    supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('is_read', false),
  ])

  const totalRevenue = invoices.data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  return {
    totalClients: clients.count || 0,
    activeProjects: projects.count || 0,
    totalQuotes: quotes.count || 0,
    totalRevenue,
    unreadAlerts: alerts.count || 0,
  }
}

interface RecentProject {
  project_id: string
  project_name: string
  status: string
  clients: { company_name: string } | null
}

async function getRecentProjects() {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('projects')
    .select('project_id, project_name, status, clients(company_name)')
    .eq('archived', false)
    .order('updated_at', { ascending: false })
    .limit(5)
    .returns<RecentProject[]>()

  return data || []
}

export default async function DashboardPage() {
  const stats = await getStats()
  const recentProjects = await getRecentProjects()

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Resumen de tu actividad en Anclora"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Proyectos activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Total facturado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Sin leer
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Proyectos recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay proyectos aún</p>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <Link
                    key={project.project_id}
                    href={`/dashboard/projects/${project.project_id}/edit`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{project.project_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.clients?.company_name}
                      </p>
                    </div>
                    <span className="text-xs capitalize text-muted-foreground">
                      {project.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Link
                href="/dashboard/clients"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <Users className="h-5 w-5 text-primary" />
                <span>Gestionar clientes</span>
              </Link>
              <Link
                href="/dashboard/kanban"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <FolderKanban className="h-5 w-5 text-primary" />
                <span>Ver Kanban</span>
              </Link>
              <Link
                href="/dashboard/quotes/new"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <FileText className="h-5 w-5 text-primary" />
                <span>Nuevo presupuesto</span>
              </Link>
              <Link
                href="/dashboard/invoices/new"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <Receipt className="h-5 w-5 text-primary" />
                <span>Nueva factura</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
