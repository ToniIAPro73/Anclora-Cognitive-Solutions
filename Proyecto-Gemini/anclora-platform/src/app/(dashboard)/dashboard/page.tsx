'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, FileText, CheckCircle, Bell } from "lucide-react"
import { useLanguage } from "@/components/layout/language-provider"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { t } = useLanguage()
  const [statsData, setStatsData] = useState({ clients: 0, projects: 0, quotes: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: clientsCount },
        { count: projectsCount },
        { count: quotesCount },
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('quotes').select('*', { count: 'exact', head: true }),
      ])
      setStatsData({
        clients: clientsCount || 0,
        projects: projectsCount || 0,
        quotes: quotesCount || 0
      })
    }
    fetchStats()
  }, [])

  const stats = [
    {
      label: t('dash.total_clients'),
      value: statsData.clients,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100/50 dark:bg-blue-900/20",
    },
    {
      label: t('dash.active_projects'),
      value: statsData.projects,
      icon: Briefcase,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-100/50 dark:bg-teal-900/20",
    },
    {
      label: t('dash.generate_quote'),
      value: statsData.quotes,
      icon: FileText,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100/50 dark:bg-amber-900/20",
    },
    {
      label: "Completados",
      value: 0,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100/50 dark:bg-emerald-900/20",
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{t('dash.overview')}</h2>
        <p className="text-muted-foreground mt-1">
          {t('dash.summary')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border shadow-sm bg-card hover:bg-accent/5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={cn("p-2 rounded-xl transition-colors", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="text-primary font-medium mr-1">+0%</span>
                desde el último mes
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{t('dash.recent_activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground items-center justify-center py-20 border-2 border-dashed border-muted rounded-3xl">
              <div className="p-4 bg-muted rounded-full">
                 <Bell className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <p className="font-medium">{t('dash.no_activity') || 'No hay actividad reciente para mostrar.'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{t('dash.shortcuts')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <ShortcutItem 
               icon={Briefcase} 
               title={t('dash.new_project')} 
               description="Crea una ficha de proyecto"
               color="teal"
             />
             <ShortcutItem 
               icon={Users} 
               title={t('dash.add_client')} 
               description="Registra un nuevo contacto"
               color="blue"
             />
             <ShortcutItem 
               icon={FileText} 
               title={t('dash.generate_quote')} 
               description="Usa la IA para cotizar"
               color="amber"
             />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ShortcutItem({ icon: Icon, title, description, color }: any) {
  const colorMap: any = {
    teal: "text-teal-600 bg-teal-100/50 dark:text-teal-400 dark:bg-teal-900/20",
    blue: "text-blue-600 bg-blue-100/50 dark:text-blue-400 dark:bg-blue-900/20",
    amber: "text-amber-600 bg-amber-100/50 dark:text-amber-400 dark:bg-amber-900/20",
  }

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-accent rounded-2xl cursor-pointer border border-transparent hover:border-border transition-all group">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", colorMap[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-bold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
