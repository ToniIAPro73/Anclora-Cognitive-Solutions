import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Briefcase, LayoutDashboard, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 border-t-4 border-teal-600">
      {/* Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Anclora <span className="text-teal-600">Cognitive</span></span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-teal-600 transition-colors" href="/login">
            Admin
          </Link>
          <Link className="text-sm font-medium hover:text-teal-600 transition-colors" href="/portal/login">
            Portal Cliente
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-600/5 -skew-x-12 transform translate-x-1/2" />
          <div className="container px-6 md:px-12 relative">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Gestión Inteligente de Proyectos de <span className="text-teal-600">IA</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl/relaxed lg:text-2xl/relaxed font-medium">
                  Centraliza tus proyectos, presupuestos y comunicación en una plataforma diseñada para la excelencia operativa con Anclora Cognitive Solutions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button className="h-14 px-8 text-lg bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20">
                    Acceso Admin
                  </Button>
                </Link>
                <Link href="/portal/login">
                  <Button variant="outline" className="h-14 px-8 text-lg border-2 border-slate-200 hover:bg-slate-50">
                    Portal Cliente
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-24 bg-white border-y border-slate-100">
          <div className="container px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-none bg-slate-50/50 p-6 flex flex-col items-start space-y-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <LayoutDashboard className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Dashboard Unificado</h3>
                  <p className="text-slate-600 mt-2">
                    Visualiza el estado de todos tus proyectos de IA en tiempo real desde una consola centralizada.
                  </p>
                </div>
              </Card>

              <Card className="border-none shadow-none bg-slate-50/50 p-6 flex flex-col items-start space-y-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Briefcase className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Gestión de Clientes</h3>
                  <p className="text-slate-600 mt-2">
                    Manten una base de datos robusta de tus clientes, con accesos directos y seguimiento personalizado.
                  </p>
                </div>
              </Card>

              <Card className="border-none shadow-none bg-slate-50/50 p-6 flex flex-col items-start space-y-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <ShieldCheck className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Acceso Seguro</h3>
                  <p className="text-slate-600 mt-2">
                    Portal para clientes con inicio de sesión mediante Magic Link para máxima seguridad y comodidad.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-slate-100 bg-slate-50">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-teal-600" />
            <p className="text-sm font-semibold">Anclora Nexus Group © 2026</p>
          </div>
          <div className="flex gap-8">
            <Link className="text-sm text-slate-500 hover:text-teal-600 transition-colors" href="#">
              Privacidad
            </Link>
            <Link className="text-sm text-slate-500 hover:text-teal-600 transition-colors" href="#">
              Términos
            </Link>
            <Link className="text-sm text-slate-500 hover:text-teal-600 transition-colors" href="#">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
