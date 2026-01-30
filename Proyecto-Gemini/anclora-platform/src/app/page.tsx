'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bot, Briefcase, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { LanguageToggle } from '@/components/layout/language-toggle'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Anclora <span className="text-primary">Cognitive</span></span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-x-4 mr-4">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
              Admin
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/portal/login">
              Portal Cliente
            </Link>
          </div>
          <LanguageToggle />
          <ThemeToggle />
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 bg-muted/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2" />
          <div className="container px-6 md:px-12 relative mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Gestión Inteligente de Proyectos de <span className="text-primary">IA</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-2xl/relaxed font-medium">
                  Centraliza tus proyectos, presupuestos y comunicación en una plataforma diseñada para la excelencia operativa con Anclora Cognitive Solutions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    Acceso Admin
                  </Button>
                </Link>
                <Link href="/portal/login">
                  <Button variant="outline" className="h-14 px-8 text-lg border-2 hover:bg-muted transition-all hover:scale-105 active:scale-95">
                    Portal Cliente
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-24 bg-background border-y border-border">
          <div className="container px-6 md:px-12 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={LayoutDashboard}
                title="Dashboard Unificado"
                description="Visualiza el estado de todos tus proyectos de IA en tiempo real desde una consola centralizada."
              />
              <FeatureCard 
                icon={Briefcase}
                title="Gestión de Clientes"
                description="Manten una base de datos robusta de tus clientes, con accesos directos y seguimiento personalizado."
              />
              <FeatureCard 
                icon={ShieldCheck}
                title="Acceso Seguro"
                description="Portal para clientes con inicio de sesión mediante Magic Link para máxima seguridad y comodidad."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-border bg-muted/30 mt-auto">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6 mx-auto">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Anclora Nexus Group © 2026</p>
          </div>
          <div className="flex gap-8">
            <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">
              Privacidad
            </Link>
            <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">
              Términos
            </Link>
            <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <Card className="border-none shadow-none bg-muted/20 hover:bg-muted/40 transition-colors p-8 rounded-3xl flex flex-col items-start space-y-4">
      <CardContent className="p-0 space-y-4">
        <div className="p-4 bg-background rounded-2xl shadow-sm border border-border">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold">{title}</h3>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
