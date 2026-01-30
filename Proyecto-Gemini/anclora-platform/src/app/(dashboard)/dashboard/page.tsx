'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, FileText, CheckCircle, Bell, ArrowUpRight, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
      shadow: "shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] hover:shadow-[0_30px_60px_-12px_rgba(59,130,246,0.3)]",
      gradient: "from-blue-500/5 to-transparent",
    },
    {
      label: t('dash.active_projects'),
      value: statsData.projects,
      icon: Briefcase,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-100/50 dark:bg-teal-900/20",
      shadow: "shadow-[0_20px_40px_-15px_rgba(20,184,166,0.15)] hover:shadow-[0_30px_60px_-12px_rgba(20,184,166,0.3)]",
      gradient: "from-teal-500/5 to-transparent",
    },
    {
      label: t('dash.generate_quote'),
      value: statsData.quotes,
      icon: FileText,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100/50 dark:bg-amber-900/20",
      shadow: "shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] hover:shadow-[0_30px_60px_-12px_rgba(245,158,11,0.3)]",
      gradient: "from-amber-500/5 to-transparent",
    },
    {
      label: "Completados",
      value: 0,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100/50 dark:bg-emerald-900/20",
      shadow: "shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:shadow-[0_30px_60px_-12px_rgba(16,185,129,0.3)]",
      gradient: "from-emerald-500/5 to-transparent",
    },
  ]

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-[1600px] mx-auto pb-16 px-4 md:px-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
          {t('dash.overview')}
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl">
          {t('dash.summary')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card 
            key={stat.label} 
            className={cn(
              "group relative border-border/40 transition-all duration-500 bg-card/60 backdrop-blur-md hover:-translate-y-3 active:scale-[0.97] rounded-[2.5rem] overflow-hidden",
              stat.shadow
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Ambient Background Gradient */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", stat.gradient)} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 relative z-10">
              <CardTitle className="text-xs font-black text-muted-foreground/80 tracking-[0.2em] uppercase">
                {stat.label}
              </CardTitle>
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 shadow-lg", 
                stat.bgColor
              )}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <div className="text-5xl font-black text-foreground tracking-tighter group-hover:tracking-normal transition-all duration-500">
                  {stat.value}
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 flex items-center font-bold tracking-widest uppercase">
                <span className="text-primary mr-2 flex items-center bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0%
                </span>
                Desde el último mes
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/40 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.1)] dark:shadow-primary/5 bg-card/40 backdrop-blur-xl rounded-[3rem] overflow-hidden group">
          <CardHeader className="border-b border-border/40 py-8 px-10 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-black tracking-tight flex items-center">
                <div className="w-2 h-8 bg-primary rounded-full mr-4 group-hover:h-4 transition-all duration-500" />
                {t('dash.recent_activity')}
              </CardTitle>
              <Badge variant="outline" className="rounded-full px-4 border-primary/30 text-primary font-bold">En tiempo real</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="flex flex-col gap-8 text-sm text-center items-center justify-center py-24 border-2 border-dashed border-muted/30 rounded-[3.5rem] bg-muted/5 group-hover:bg-muted/10 transition-colors duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative p-8 bg-background shadow-2xl rounded-full ring-12 ring-muted/10">
                   <Bell className="h-10 w-10 text-muted-foreground/30" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="font-black text-foreground/90 text-2xl">{t('dash.no_activity') || 'Descanso total'}</p>
                <p className="text-muted-foreground max-w-sm mx-auto text-base font-medium">Tus flujos están tranquilos. ¡Aprovecha para generar una nueva propuesta con la IA!</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-border/40 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.1)] dark:shadow-primary/5 bg-card/40 backdrop-blur-xl rounded-[3rem] overflow-hidden">
          <CardHeader className="border-b border-border/40 py-8 px-10 bg-muted/20">
            <CardTitle className="text-2xl font-black tracking-tight">{t('dash.shortcuts')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
             <ShortcutItem 
               icon={Briefcase} 
               title={t('dash.new_project')} 
               description="Inicia un nuevo flujo de trabajo"
               color="teal"
             />
             <ShortcutItem 
               icon={Users} 
               title={t('dash.add_client')} 
               description="Amplía tu red de contactos"
               color="blue"
             />
             <ShortcutItem 
               icon={FileText} 
               title={t('dash.generate_quote')} 
               description="Cotización inteligente en segundos"
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
    teal: "text-teal-600 bg-teal-100/50 dark:text-teal-400 dark:bg-teal-900/20 ring-teal-500/10",
    blue: "text-blue-600 bg-blue-100/50 dark:text-blue-400 dark:bg-blue-900/20 ring-blue-500/10",
    amber: "text-amber-600 bg-amber-100/50 dark:text-amber-400 dark:bg-amber-900/20 ring-amber-500/10",
  }

  return (
    <div className="flex items-center gap-6 p-6 hover:bg-primary/5 rounded-[2.5rem] cursor-pointer border border-transparent hover:border-primary/20 transition-all duration-500 group relative overflow-hidden active:scale-95">
      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500 ring-8", colorMap[color])}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="flex-1">
        <p className="font-black text-lg text-foreground/90 leading-tight">{title}</p>
        <p className="text-sm text-muted-foreground font-semibold opacity-80">{description}</p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0 duration-700">
        <ArrowUpRight className="h-6 w-6 text-primary" />
      </div>
    </div>
  )
}
