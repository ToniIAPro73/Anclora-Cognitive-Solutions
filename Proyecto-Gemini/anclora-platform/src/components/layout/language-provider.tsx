'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'es' | 'en' | 'de'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    'nav.search': 'Buscar...',
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Clientes',
    'nav.projects': 'Proyectos',
    'nav.kanban': 'Kanban',
    'nav.quotes': 'Presupuestos',
    'nav.invoices': 'Facturas',
    'nav.alerts': 'Alertas',
    'nav.logout': 'Cerrar Sesión',
    'dash.welcome': 'Bienvenido de nuevo',
    'dash.overview': 'Dashboard Overview',
    'dash.summary': 'Aquí tienes un resumen de la actividad actual.',
    'dash.total_clients': 'Clientes Totales',
    'dash.active_projects': 'Proyectos Activos',
    'dash.recent_activity': 'Actividad Reciente',
    'dash.shortcuts': 'Accesos Directos',
    'dash.new_project': 'Nuevo Proyecto',
    'dash.add_client': 'Añadir Cliente',
    'dash.generate_quote': 'Generar Presupuesto',
  },
  en: {
    'nav.search': 'Search...',
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Clients',
    'nav.projects': 'Projects',
    'nav.kanban': 'Kanban',
    'nav.quotes': 'Quotes',
    'nav.invoices': 'Invoices',
    'nav.alerts': 'Alerts',
    'nav.logout': 'Logout',
    'dash.welcome': 'Welcome back',
    'dash.overview': 'Dashboard Overview',
    'dash.summary': 'Here is a summary of current activity.',
    'dash.total_clients': 'Total Clients',
    'dash.active_projects': 'Active Projects',
    'dash.recent_activity': 'Recent Activity',
    'dash.shortcuts': 'Shortcuts',
    'dash.new_project': 'New Project',
    'dash.add_client': 'Add Client',
    'dash.generate_quote': 'Generate Quote',
  },
  de: {
    'nav.search': 'Suchen...',
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Kunden',
    'nav.projects': 'Projekte',
    'nav.kanban': 'Kanban',
    'nav.quotes': 'Angebote',
    'nav.invoices': 'Rechnungen',
    'nav.alerts': 'Warnungen',
    'nav.logout': 'Abmelden',
    'dash.welcome': 'Willkommen zurück',
    'dash.overview': 'Dashboard-Übersicht',
    'dash.summary': 'Hier ist eine Zusammenfassung der aktuellen Aktivitäten.',
    'dash.total_clients': 'Gesamtkunden',
    'dash.active_projects': 'Aktive Projekte',
    'dash.recent_activity': 'Kürzliche Aktivitäten',
    'dash.shortcuts': 'Verknüpfungen',
    'dash.new_project': 'Neues Projekt',
    'dash.add_client': 'Kunden hinzufügen',
    'dash.generate_quote': 'Angebot erstellen',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es')

  const t = (key: string) => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
