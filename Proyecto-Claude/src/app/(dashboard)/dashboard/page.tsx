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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        <div className="stat-card group">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Clientes</p>
              <p className="text-3xl font-bold mt-2 count-animated">{stats.totalClients}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clientes registrados
              </p>
            </div>
            <div className="stat-card-icon shrink-0">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Proyectos</p>
              <p className="text-3xl font-bold mt-2 count-animated">{stats.activeProjects}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Proyectos activos
              </p>
            </div>
            <div className="stat-card-icon shrink-0">
              <FolderKanban className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
              <p className="text-2xl font-bold mt-2 count-animated truncate" title={formatCurrency(stats.totalRevenue)}>
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total facturado
              </p>
            </div>
            <div className="stat-card-icon shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Alertas</p>
              <p className="text-3xl font-bold mt-2 count-animated">{stats.unreadAlerts}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sin leer
              </p>
            </div>
            <div className="stat-card-icon shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 stagger-children">
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold mb-4">Proyectos recientes</h3>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay proyectos aún</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project, index) => (
                <Link
                  key={project.project_id}
                  href={`/dashboard/projects/${project.project_id}/edit`}
                  className="group flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all duration-300 hover:border-accent/40 hover:bg-accent/5 hover:shadow-md"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent/50 group-hover:bg-accent transition-colors" />
                    <div>
                      <p className="font-medium group-hover:text-accent transition-colors">{project.project_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.clients?.company_name}
                      </p>
                    </div>
                  </div>
                  <span className="status-badge bg-muted text-muted-foreground capitalize">
                    {project.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold mb-4">Accesos rápidos</h3>
          <div className="grid gap-3">
            <Link
              href="/dashboard/clients"
              className="group flex items-center gap-4 rounded-lg border border-border/50 p-4 transition-all duration-300 hover:border-accent/40 hover:bg-accent/5 hover:shadow-md hover:translate-x-1"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                <Users className="h-5 w-5" />
              </div>
              <span className="font-medium group-hover:text-accent transition-colors">Gestionar clientes</span>
            </Link>
            <Link
              href="/dashboard/kanban"
              className="group flex items-center gap-4 rounded-lg border border-border/50 p-4 transition-all duration-300 hover:border-accent/40 hover:bg-accent/5 hover:shadow-md hover:translate-x-1"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                <FolderKanban className="h-5 w-5" />
              </div>
              <span className="font-medium group-hover:text-accent transition-colors">Ver Kanban</span>
            </Link>
            <Link
              href="/dashboard/quotes/new"
              className="group flex items-center gap-4 rounded-lg border border-border/50 p-4 transition-all duration-300 hover:border-accent/40 hover:bg-accent/5 hover:shadow-md hover:translate-x-1"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-medium group-hover:text-accent transition-colors">Nuevo presupuesto</span>
            </Link>
            <Link
              href="/dashboard/invoices/new"
              className="group flex items-center gap-4 rounded-lg border border-border/50 p-4 transition-all duration-300 hover:border-accent/40 hover:bg-accent/5 hover:shadow-md hover:translate-x-1"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                <Receipt className="h-5 w-5" />
              </div>
              <span className="font-medium group-hover:text-accent transition-colors">Nueva factura</span>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
