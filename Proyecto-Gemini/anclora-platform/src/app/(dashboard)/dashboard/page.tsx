import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, FileText, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch some basic stats for the dashboard
  const [
    { count: clientsCount },
    { count: projectsCount },
    { count: quotesCount },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('quotes').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      label: "Clientes Totales",
      value: clientsCount || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Proyectos Activos",
      value: projectsCount || 0,
      icon: Briefcase,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      label: "Presupuestos",
      value: quotesCount || 0,
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      label: "Completados",
      value: 0, // Mock for now
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Bienvenido de nuevo. Aquí tienes un resumen de la actividad actual.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                +0 desde el último mes
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground items-center justify-center py-12 border-2 border-dashed rounded-xl">
              <p>No hay actividad reciente para mostrar.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Accesos Directos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer border">
                <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Nuevo Proyecto</p>
                  <p className="text-xs text-muted-foreground">Crea una ficha de proyecto</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer border">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Añadir Cliente</p>
                  <p className="text-xs text-muted-foreground">Registra un nuevo contacto</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer border">
                <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Generar Presupuesto</p>
                  <p className="text-xs text-muted-foreground">Usa la IA para cotizar</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
