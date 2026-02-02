export const locales = ['es', 'en', 'fr', 'de'] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
}

export const translations = {
  es: {
    nav: {
      admin: 'Admin',
      clientPortal: 'Portal Cliente',
    },
    hero: {
      title: 'Gestión Inteligente de',
      titleHighlight: 'Proyectos de IA',
      subtitle: 'Centraliza tus proyectos, presupuestos y comunicación en una plataforma diseñada para la excelencia operativa con inteligencia artificial.',
      ctaAdmin: 'Acceso Admin',
      ctaClient: 'Portal Cliente',
    },
    features: {
      title: 'Todo lo que necesitas',
      subtitle: 'Herramientas potentes para gestionar tu consultoría de IA',
      dashboard: {
        title: 'Dashboard Inteligente',
        description: 'Visualiza el estado de todos tus proyectos en tiempo real con métricas predictivas y alertas automáticas.',
      },
      clients: {
        title: 'Gestión de Clientes',
        description: 'Base de datos completa con seguimiento personalizado, historial de proyectos y comunicación centralizada.',
      },
      security: {
        title: 'Acceso Seguro',
        description: 'Portal exclusivo para clientes con autenticación Magic Link y acceso controlado a sus proyectos.',
      },
      quotes: {
        title: 'Presupuestos con IA',
        description: 'Genera propuestas profesionales automáticamente con IA adaptada al contexto de cada proyecto.',
      },
      kanban: {
        title: 'Kanban Visual',
        description: 'Gestiona el flujo de trabajo con un tablero drag-and-drop y actualizaciones en tiempo real.',
      },
      invoices: {
        title: 'Facturación Integrada',
        description: 'Crea y gestiona facturas vinculadas a proyectos con seguimiento automático de pagos.',
      },
    },
    cta: {
      title: '¿Listo para transformar tu gestión?',
      subtitle: 'Únete a las consultorías de IA que ya confían en Anclora',
      button: 'Comenzar ahora',
    },
    footer: {
      copyright: '© 2026 Anclora Nexus Group. Todos los derechos reservados.',
      privacy: 'Privacidad',
      terms: 'Términos',
      contact: 'Contacto',
    },
  },
  en: {
    nav: {
      admin: 'Admin',
      clientPortal: 'Client Portal',
    },
    hero: {
      title: 'Intelligent Management of',
      titleHighlight: 'AI Projects',
      subtitle: 'Centralize your projects, budgets, and communication in a platform designed for operational excellence with artificial intelligence.',
      ctaAdmin: 'Admin Access',
      ctaClient: 'Client Portal',
    },
    features: {
      title: 'Everything you need',
      subtitle: 'Powerful tools to manage your AI consultancy',
      dashboard: {
        title: 'Smart Dashboard',
        description: 'Visualize the status of all your projects in real-time with predictive metrics and automatic alerts.',
      },
      clients: {
        title: 'Client Management',
        description: 'Complete database with personalized tracking, project history, and centralized communication.',
      },
      security: {
        title: 'Secure Access',
        description: 'Exclusive client portal with Magic Link authentication and controlled access to their projects.',
      },
      quotes: {
        title: 'AI-Powered Quotes',
        description: 'Automatically generate professional proposals with AI adapted to each project context.',
      },
      kanban: {
        title: 'Visual Kanban',
        description: 'Manage workflow with a drag-and-drop board and real-time updates.',
      },
      invoices: {
        title: 'Integrated Invoicing',
        description: 'Create and manage invoices linked to projects with automatic payment tracking.',
      },
    },
    cta: {
      title: 'Ready to transform your management?',
      subtitle: 'Join the AI consultancies that already trust Anclora',
      button: 'Get started',
    },
    footer: {
      copyright: '© 2026 Anclora Nexus Group. All rights reserved.',
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact',
    },
  },
  fr: {
    nav: {
      admin: 'Admin',
      clientPortal: 'Portail Client',
    },
    hero: {
      title: 'Gestion Intelligente des',
      titleHighlight: "Projets d'IA",
      subtitle: "Centralisez vos projets, budgets et communications sur une plateforme conçue pour l'excellence opérationnelle avec intelligence artificielle.",
      ctaAdmin: 'Accès Admin',
      ctaClient: 'Portail Client',
    },
    features: {
      title: 'Tout ce dont vous avez besoin',
      subtitle: 'Des outils puissants pour gérer votre cabinet de conseil en IA',
      dashboard: {
        title: 'Tableau de Bord Intelligent',
        description: "Visualisez l'état de tous vos projets en temps réel avec des métriques prédictives et des alertes automatiques.",
      },
      clients: {
        title: 'Gestion des Clients',
        description: 'Base de données complète avec suivi personnalisé, historique des projets et communication centralisée.',
      },
      security: {
        title: 'Accès Sécurisé',
        description: 'Portail exclusif pour les clients avec authentification Magic Link et accès contrôlé à leurs projets.',
      },
      quotes: {
        title: 'Devis avec IA',
        description: 'Générez automatiquement des propositions professionnelles avec IA adaptée au contexte de chaque projet.',
      },
      kanban: {
        title: 'Kanban Visuel',
        description: 'Gérez le flux de travail avec un tableau drag-and-drop et des mises à jour en temps réel.',
      },
      invoices: {
        title: 'Facturation Intégrée',
        description: 'Créez et gérez des factures liées aux projets avec suivi automatique des paiements.',
      },
    },
    cta: {
      title: 'Prêt à transformer votre gestion?',
      subtitle: 'Rejoignez les cabinets de conseil en IA qui font déjà confiance à Anclora',
      button: 'Commencer',
    },
    footer: {
      copyright: '© 2026 Anclora Nexus Group. Tous droits réservés.',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      contact: 'Contact',
    },
  },
  de: {
    nav: {
      admin: 'Admin',
      clientPortal: 'Kundenportal',
    },
    hero: {
      title: 'Intelligentes Management von',
      titleHighlight: 'KI-Projekten',
      subtitle: 'Zentralisieren Sie Ihre Projekte, Budgets und Kommunikation auf einer Plattform, die für operative Exzellenz mit künstlicher Intelligenz entwickelt wurde.',
      ctaAdmin: 'Admin-Zugang',
      ctaClient: 'Kundenportal',
    },
    features: {
      title: 'Alles was Sie brauchen',
      subtitle: 'Leistungsstarke Tools zur Verwaltung Ihrer KI-Beratung',
      dashboard: {
        title: 'Intelligentes Dashboard',
        description: 'Visualisieren Sie den Status aller Ihrer Projekte in Echtzeit mit prädiktiven Metriken und automatischen Warnungen.',
      },
      clients: {
        title: 'Kundenverwaltung',
        description: 'Vollständige Datenbank mit personalisiertem Tracking, Projekthistorie und zentralisierter Kommunikation.',
      },
      security: {
        title: 'Sicherer Zugang',
        description: 'Exklusives Kundenportal mit Magic Link-Authentifizierung und kontrolliertem Zugriff auf ihre Projekte.',
      },
      quotes: {
        title: 'KI-gestützte Angebote',
        description: 'Erstellen Sie automatisch professionelle Vorschläge mit KI, die an den Kontext jedes Projekts angepasst ist.',
      },
      kanban: {
        title: 'Visuelles Kanban',
        description: 'Verwalten Sie den Workflow mit einem Drag-and-Drop-Board und Echtzeit-Updates.',
      },
      invoices: {
        title: 'Integrierte Rechnungsstellung',
        description: 'Erstellen und verwalten Sie Rechnungen, die mit Projekten verknüpft sind, mit automatischer Zahlungsverfolgung.',
      },
    },
    cta: {
      title: 'Bereit, Ihr Management zu transformieren?',
      subtitle: 'Schließen Sie sich den KI-Beratungen an, die bereits auf Anclora vertrauen',
      button: 'Jetzt starten',
    },
    footer: {
      copyright: '© 2026 Anclora Nexus Group. Alle Rechte vorbehalten.',
      privacy: 'Datenschutz',
      terms: 'AGB',
      contact: 'Kontakt',
    },
  },
} as const

export type TranslationKey = keyof typeof translations.es
