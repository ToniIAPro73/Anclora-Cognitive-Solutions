export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  anclora: {
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
          // Verifactu fields
          verifactu_status: VerifactuStatus
          verifactu_id: string | null
          verifactu_qr: string | null
          verifactu_csv: string | null
          verifactu_url: string | null
          verifactu_hash: string | null
          verifactu_registered_at: string | null
          verifactu_error_message: string | null
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
          // Verifactu fields
          verifactu_status?: VerifactuStatus
          verifactu_id?: string | null
          verifactu_qr?: string | null
          verifactu_csv?: string | null
          verifactu_url?: string | null
          verifactu_hash?: string | null
          verifactu_registered_at?: string | null
          verifactu_error_message?: string | null
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
          // Verifactu fields
          verifactu_status?: VerifactuStatus
          verifactu_id?: string | null
          verifactu_qr?: string | null
          verifactu_csv?: string | null
          verifactu_url?: string | null
          verifactu_hash?: string | null
          verifactu_registered_at?: string | null
          verifactu_error_message?: string | null
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
      verifactu_config: {
        Row: {
          config_id: string
          nif_emisor: string
          nombre_emisor: string
          entorno: 'sandbox' | 'production'
          api_key: string | null
          api_secret: string | null
          enabled: boolean
          software_id: string
          software_version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          config_id?: string
          nif_emisor: string
          nombre_emisor: string
          entorno?: 'sandbox' | 'production'
          api_key?: string | null
          api_secret?: string | null
          enabled?: boolean
          software_id?: string
          software_version?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          config_id?: string
          nif_emisor?: string
          nombre_emisor?: string
          entorno?: 'sandbox' | 'production'
          api_key?: string | null
          api_secret?: string | null
          enabled?: boolean
          software_id?: string
          software_version?: string
          created_at?: string
          updated_at?: string
        }
      }
      verifactu_logs: {
        Row: {
          log_id: number
          invoice_id: string | null
          action: VerifactuLogAction
          status: VerifactuLogStatus
          request_payload: Json | null
          response_payload: Json | null
          error_message: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          log_id?: number
          invoice_id?: string | null
          action: VerifactuLogAction
          status: VerifactuLogStatus
          request_payload?: Json | null
          response_payload?: Json | null
          error_message?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          log_id?: number
          invoice_id?: string | null
          action?: VerifactuLogAction
          status?: VerifactuLogStatus
          request_payload?: Json | null
          response_payload?: Json | null
          error_message?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
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
export type VerifactuStatus = 'not_registered' | 'pending' | 'registered' | 'error' | 'cancelled'
export type VerifactuLogAction = 'register' | 'retry' | 'cancel' | 'query' | 'config_update'
export type VerifactuLogStatus = 'pending' | 'success' | 'error'

// Content types
export interface QuoteService {
  name: string
  description: string
  hours: number
  hourly_rate: number
  amount: number
  total?: number // Alias for amount, used in some components
}

export interface QuoteContent {
  introduction: string
  services: QuoteService[]
  timeline: string
  payment_terms: string
  conclusion: string
  validity?: string
  subtotal?: number
  iva?: number
  total?: number
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

// Table row types shortcuts
export type Client = Database['anclora']['Tables']['clients']['Row']
export type ClientInsert = Database['anclora']['Tables']['clients']['Insert']
export type ClientUpdate = Database['anclora']['Tables']['clients']['Update']

export type Project = Database['anclora']['Tables']['projects']['Row']
export type ProjectInsert = Database['anclora']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['anclora']['Tables']['projects']['Update']

export type Quote = Database['anclora']['Tables']['quotes']['Row']
export type QuoteInsert = Database['anclora']['Tables']['quotes']['Insert']
export type QuoteUpdate = Database['anclora']['Tables']['quotes']['Update']

export type Invoice = Database['anclora']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['anclora']['Tables']['invoices']['Insert']
export type InvoiceUpdate = Database['anclora']['Tables']['invoices']['Update']

export type Alert = Database['anclora']['Tables']['alerts']['Row']
export type AuditLog = Database['anclora']['Tables']['audit_logs']['Row']

export type VerifactuConfig = Database['anclora']['Tables']['verifactu_config']['Row']
export type VerifactuConfigInsert = Database['anclora']['Tables']['verifactu_config']['Insert']
export type VerifactuConfigUpdate = Database['anclora']['Tables']['verifactu_config']['Update']

export type VerifactuLog = Database['anclora']['Tables']['verifactu_logs']['Row']
export type VerifactuLogInsert = Database['anclora']['Tables']['verifactu_logs']['Insert']

// Extended types with relations
export interface ProjectWithClient extends Project {
  clients: Client
}

export interface ProjectWithClientSummary extends Project {
  clients: { company_name: string; email: string } | null
}

export interface QuoteWithProject extends Quote {
  projects: ProjectWithClient
}

export interface InvoiceWithProject extends Invoice {
  projects: ProjectWithClient
}

// Verifactu data interface for registration
export interface VerifactuRegistrationData {
  hash: string
  csv: string
  qr: string
  url: string
  verifactuId: string
}
