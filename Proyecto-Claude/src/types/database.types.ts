export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          client_id: string
          company_name: string
          email: string
          contact_person: string | null
          phone: string | null
          address: string | null
          nif_cif: string | null
          preferred_language: 'es' | 'en' | 'ca'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          client_id?: string
          company_name: string
          email: string
          contact_person?: string | null
          phone?: string | null
          address?: string | null
          nif_cif?: string | null
          preferred_language?: 'es' | 'en' | 'ca'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          company_name?: string
          email?: string
          contact_person?: string | null
          phone?: string | null
          address?: string | null
          nif_cif?: string | null
          preferred_language?: 'es' | 'en' | 'ca'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          project_id: string
          client_id: string
          project_name: string
          description: string | null
          status: ProjectStatus
          budget: number | null
          deadline: string | null
          priority: ProjectPriority
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          project_id?: string
          client_id: string
          project_name: string
          description?: string | null
          status?: ProjectStatus
          budget?: number | null
          deadline?: string | null
          priority?: ProjectPriority
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          project_id?: string
          client_id?: string
          project_name?: string
          description?: string | null
          status?: ProjectStatus
          budget?: number | null
          deadline?: string | null
          priority?: ProjectPriority
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          quote_id: string
          project_id: string
          version: number
          status: QuoteStatus
          language: 'es' | 'en' | 'ca'
          tone: string | null
          content_json: QuoteContent
          subtotal: number
          iva: number
          total: number
          pdf_url: string | null
          created_at: string
          sent_at: string | null
          viewed_at: string | null
        }
        Insert: {
          quote_id?: string
          project_id: string
          version?: number
          status?: QuoteStatus
          language?: 'es' | 'en' | 'ca'
          tone?: string | null
          content_json: QuoteContent
          subtotal: number
          iva: number
          total: number
          pdf_url?: string | null
          created_at?: string
          sent_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          quote_id?: string
          project_id?: string
          version?: number
          status?: QuoteStatus
          language?: 'es' | 'en' | 'ca'
          tone?: string | null
          content_json?: QuoteContent
          subtotal?: number
          iva?: number
          total?: number
          pdf_url?: string | null
          created_at?: string
          sent_at?: string | null
          viewed_at?: string | null
        }
      }
      invoices: {
        Row: {
          invoice_id: string
          project_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          status: InvoiceStatus
          line_items: InvoiceLineItem[]
          subtotal: number
          iva: number
          total: number
          pdf_url: string | null
          paid_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          invoice_id?: string
          project_id: string
          invoice_number?: string
          issue_date?: string
          due_date: string
          status?: InvoiceStatus
          line_items: InvoiceLineItem[]
          subtotal: number
          iva: number
          total: number
          pdf_url?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          invoice_id?: string
          project_id?: string
          invoice_number?: string
          issue_date?: string
          due_date?: string
          status?: InvoiceStatus
          line_items?: InvoiceLineItem[]
          subtotal?: number
          iva?: number
          total?: number
          pdf_url?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          alert_id: string
          project_id: string | null
          client_id: string | null
          type: AlertType
          priority: AlertPriority
          message: string
          is_read: boolean
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          alert_id?: string
          project_id?: string | null
          client_id?: string | null
          type: AlertType
          priority?: AlertPriority
          message: string
          is_read?: boolean
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          alert_id?: string
          project_id?: string | null
          client_id?: string | null
          type?: AlertType
          priority?: AlertPriority
          message?: string
          is_read?: boolean
          created_at?: string
          resolved_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          log_id: number
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          changed_by: string | null
          changed_at: string
        }
        Insert: {
          log_id?: number
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          changed_by?: string | null
          changed_at?: string
        }
        Update: {
          log_id?: number
          table_name?: string
          record_id?: string
          action?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          changed_by?: string | null
          changed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Enum types
export type ProjectStatus = 'backlog' | 'proposal' | 'approved' | 'in_progress' | 'testing' | 'completed' | 'cancelled'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type AlertType = 'deadline_approaching' | 'budget_exceeded' | 'invoice_overdue' | 'project_stale' | 'client_inactive'
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical'

// Content types
export interface QuoteService {
  name: string
  description: string
  hours: number
  hourly_rate: number
  amount: number
}

export interface QuoteContent {
  introduction: string
  services: QuoteService[]
  timeline: string
  payment_terms: string
  conclusion: string
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

// Table row types shortcuts
export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type Quote = Database['public']['Tables']['quotes']['Row']
export type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
export type QuoteUpdate = Database['public']['Tables']['quotes']['Update']

export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

export type Alert = Database['public']['Tables']['alerts']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

// Extended types with relations
export interface ProjectWithClient extends Project {
  clients: Client
}

export interface QuoteWithProject extends Quote {
  projects: ProjectWithClient
}

export interface InvoiceWithProject extends Invoice {
  projects: ProjectWithClient
}
