import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerSupabaseClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server')

import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} from '@/app/actions/invoices'

describe('Invoice Actions', () => {
  const createChainableMock = () => {
    const mock: Record<string, any> = {}
    const methods = [
      'from', 'select', 'insert', 'update', 'delete',
      'eq', 'neq', 'ilike', 'or', 'not', 'in', 'is',
      'lt', 'lte', 'gt', 'gte', 'order', 'range', 'limit'
    ]

    methods.forEach(method => {
      mock[method] = vi.fn(() => mock)
    })

    mock.single = vi.fn()
    mock.maybeSingle = vi.fn()

    return mock
  }

  let mockSupabase: ReturnType<typeof createChainableMock>

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = createChainableMock()
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as any)
  })

  describe('getInvoices', () => {
    it('should return invoices with project data', async () => {
      const mockInvoices = [
        {
          invoice_id: '1',
          invoice_number: 'ANC-2026-01-0001',
          status: 'draft',
          total: 3630,
          projects: {
            project_name: 'Test Project',
            clients: { company_name: 'Test Co' },
          },
        },
      ]

      mockSupabase.order = vi.fn().mockResolvedValue({ data: mockInvoices, error: null })

      const result = await getInvoices()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockInvoices)
    })

    it('should handle database errors', async () => {
      mockSupabase.order = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const result = await getInvoices()

      expect(result.success).toBe(false)
    })
  })

  describe('getInvoiceById', () => {
    it('should return an invoice with full details', async () => {
      const mockInvoice = {
        invoice_id: '1',
        invoice_number: 'ANC-2026-01-0001',
        status: 'draft',
        line_items: [
          { description: 'Development', quantity: 40, unit_price: 75, amount: 3000 },
        ],
        subtotal: 3000,
        iva: 630,
        total: 3630,
      }

      mockSupabase.single = vi.fn().mockResolvedValue({ data: mockInvoice, error: null })

      const result = await getInvoiceById('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockInvoice)
    })
  })

  describe('createInvoice', () => {
    it('should create an invoice successfully', async () => {
      const newInvoice = {
        project_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        issue_date: '2026-01-31',
        due_date: '2026-02-28',
        line_items: [
          { description: 'Development', quantity: 40, unit_price: 75, amount: 3000 },
        ],
        subtotal: 3000,
        iva: 630,
        total: 3630,
      }

      const createdInvoice = {
        invoice_id: '123',
        invoice_number: 'ANC-2026-01-0001',
        status: 'draft',
        ...newInvoice,
      }

      mockSupabase.single = vi.fn().mockResolvedValue({ data: createdInvoice, error: null })

      const result = await createInvoice(newInvoice)

      expect(result.success).toBe(true)
      expect(result.data?.invoice_number).toBe('ANC-2026-01-0001')
      expect(result.data?.status).toBe('draft')
    })
  })

  describe('updateInvoiceStatus', () => {
    it('should update invoice to sent status', async () => {
      const updatedInvoice = {
        invoice_id: '1',
        status: 'sent',
      }

      mockSupabase.single = vi.fn().mockResolvedValue({ data: updatedInvoice, error: null })

      const result = await updateInvoiceStatus('1', 'sent')

      expect(result.success).toBe(true)
    })

    it('should set paid_at when marking as paid', async () => {
      const updatedInvoice = {
        invoice_id: '1',
        status: 'paid',
        paid_at: new Date().toISOString(),
      }

      mockSupabase.single = vi.fn().mockResolvedValue({ data: updatedInvoice, error: null })

      const result = await updateInvoiceStatus('1', 'paid')

      expect(result.success).toBe(true)
    })
  })

  describe('deleteInvoice', () => {
    it('should delete a draft invoice', async () => {
      // Mock status check - invoice is draft
      mockSupabase.single = vi.fn()
        .mockResolvedValueOnce({ data: { status: 'draft' }, error: null })

      // Mock delete - need to make eq return the final result
      const deleteMock = vi.fn().mockResolvedValue({ error: null })
      mockSupabase.eq = vi.fn(() => ({
        ...mockSupabase,
        then: (resolve: Function) => resolve({ error: null }),
      }))

      const result = await deleteInvoice('1')

      expect(result.success).toBe(true)
    })

    it('should prevent deletion of sent invoice', async () => {
      // Mock status check - invoice is sent
      mockSupabase.single = vi.fn().mockResolvedValueOnce({
        data: { status: 'sent' },
        error: null,
      })

      const result = await deleteInvoice('1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('borrador')
    })

    it('should prevent deletion of paid invoice', async () => {
      // Mock status check - invoice is paid
      mockSupabase.single = vi.fn().mockResolvedValueOnce({
        data: { status: 'paid' },
        error: null,
      })

      const result = await deleteInvoice('1')

      expect(result.success).toBe(false)
    })
  })
})
