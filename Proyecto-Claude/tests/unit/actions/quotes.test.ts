import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerSupabaseClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server')

import {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuoteStatus,
  deleteQuote,
} from '@/app/actions/quotes'

describe('Quote Actions', () => {
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

  describe('getQuotes', () => {
    it('should return quotes with project data', async () => {
      const mockQuotes = [
        {
          quote_id: '1',
          project_id: '1',
          version: 1,
          status: 'draft',
          total: 5000,
          projects: { project_name: 'Test Project' },
        },
      ]

      mockSupabase.order = vi.fn().mockResolvedValue({ data: mockQuotes, error: null })

      const result = await getQuotes()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockQuotes)
      expect(mockSupabase.select).toHaveBeenCalledWith('*, projects(*, clients(*))')
    })

    it('should handle database errors', async () => {
      mockSupabase.order = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const result = await getQuotes()

      expect(result.success).toBe(false)
    })
  })

  describe('getQuoteById', () => {
    it('should return a quote with full details', async () => {
      const mockQuote = {
        quote_id: '1',
        version: 1,
        status: 'draft',
        content_json: {
          introduction: 'Test intro',
          services: [],
          timeline: '2 weeks',
          payment_terms: 'Net 30',
          conclusion: 'Thank you',
        },
        projects: {
          project_name: 'Test',
          clients: { company_name: 'Test Co' },
        },
      }

      mockSupabase.single = vi.fn().mockResolvedValue({ data: mockQuote, error: null })

      const result = await getQuoteById('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockQuote)
    })
  })

  describe('createQuote', () => {
    it('should create a quote successfully', async () => {
      const newQuote = {
        project_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        language: 'es' as const,
        content_json: {
          introduction: 'Test intro',
          services: [
            {
              name: 'Development',
              description: 'Web development',
              hours: 40,
              hourly_rate: 75,
              amount: 3000,
            },
          ],
          timeline: '2 weeks',
          payment_terms: 'Net 30',
          conclusion: 'Thank you',
        },
        subtotal: 3000,
        iva: 630,
        total: 3630,
      }

      const createdQuote = { quote_id: '123', version: 1, status: 'draft', ...newQuote }

      mockSupabase.single = vi.fn().mockResolvedValue({ data: createdQuote, error: null })

      const result = await createQuote(newQuote)

      expect(result.success).toBe(true)
      expect(result.data?.version).toBe(1)
      expect(result.data?.status).toBe('draft')
    })
  })

  describe('updateQuoteStatus', () => {
    it('should update quote to sent status', async () => {
      const updatedQuote = {
        quote_id: '1',
        status: 'sent',
        sent_at: expect.any(String),
      }

      mockSupabase.single = vi.fn().mockResolvedValue({ data: updatedQuote, error: null })

      const result = await updateQuoteStatus('1', 'sent')

      expect(result.success).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalled()
    })
  })

  describe('deleteQuote', () => {
    it('should delete a quote', async () => {
      mockSupabase.eq = vi.fn(() => mockSupabase)
      mockSupabase.eq.mockResolvedValueOnce({ error: null })

      const result = await deleteQuote('1')

      expect(result.success).toBe(true)
    })
  })
})
