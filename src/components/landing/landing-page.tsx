'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Kanban,
  Receipt,
  ArrowRight
} from 'lucide-react'
import { useLocale } from '@/components/providers/locale-provider'
import { ThemeToggle } from './theme-toggle'
import { LanguageSelector } from './language-selector'
import { cn } from '@/lib/utils'

export function LandingPage() {
  const { t } = useLocale()

  const features = [
    { icon: LayoutDashboard, ...t.features.dashboard },
    { icon: Users, ...t.features.clients },
    { icon: Shield, ...t.features.security },
    { icon: FileText, ...t.features.quotes },
    { icon: Kanban, ...t.features.kanban },
    { icon: Receipt, ...t.features.invoices },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Anclora Cognitive Solutions"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">
                  Anclora
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  Cognitive Solutions
                </span>
              </div>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.nav.admin}
              </Link>
              <Link
                href="/client"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.nav.clientPortal}
              </Link>
            </nav>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-foreground">{t.hero.title}</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className={cn(
                  'group flex items-center gap-2 px-8 py-4 rounded-full',
                  'bg-accent text-accent-foreground font-semibold',
                  'hover:bg-accent/90 transition-all duration-300',
                  'shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40',
                  'hover:-translate-y-0.5'
                )}
              >
                {t.hero.ctaAdmin}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/portal/login"
                className={cn(
                  'flex items-center gap-2 px-8 py-4 rounded-full',
                  'bg-primary text-primary-foreground font-semibold',
                  'hover:bg-primary/90 transition-all duration-300',
                  'shadow-md hover:shadow-lg'
                )}
              >
                {t.hero.ctaClient}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t.features.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  'group relative p-6 rounded-2xl',
                  'bg-card border border-border/50',
                  'hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10',
                  'transition-all duration-300'
                )}
              >
                <div className={cn(
                  'inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4',
                  'bg-primary/10 text-primary',
                  'group-hover:bg-accent group-hover:text-accent-foreground',
                  'transition-all duration-300'
                )}>
                  <feature.icon className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn(
            'relative max-w-4xl mx-auto text-center p-12 rounded-3xl',
            'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
            'border border-primary/20'
          )}>
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
              <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t.cta.title}
            </h2>

            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              {t.cta.subtitle}
            </p>

            <Link
              href="/login"
              className={cn(
                'inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-full',
                'bg-accent text-accent-foreground font-semibold',
                'hover:bg-accent/90 transition-all duration-300',
                'shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40'
              )}
            >
              {t.cta.button}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t.footer.copyright}
            </p>

            <nav className="flex items-center gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.footer.privacy}
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.footer.terms}
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.footer.contact}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
