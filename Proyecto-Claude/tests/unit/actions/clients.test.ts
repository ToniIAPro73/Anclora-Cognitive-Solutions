import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Mock the Supabase client before importing actions
vi.mock('@/lib/supabase/server')

// Import actions after mock setup
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '@/app/actions/clients'

describe('Client Actions', () => {
  // Create a chainable mock that always returns itself
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

    // Terminal methods that return data
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

  describe('getClients', () => {
    it('should return clients with pagination info', async () => {
      const mockClients = [
        { client_id: '1', company_name: 'Test Company', email: 'test@example.com' },
        { client_id: '2', company_name: 'Another Company', email: 'another@example.com' },
      ]

      // getClients uses .range() which returns { data, count }
      mockSupabase.range = vi.fn().mockResolvedValue({
        data: mockClients,
        count: 2,
        error: null,
      })

      const result = await getClients()

      expect(result.success).toBe(true)
      expect(result.data?.clients).toEqual(mockClients)
      expect(result.data?.total).toBe(2)
      expect(mockSupabase.from).toHaveBeenCalledWith('clients')
    })

    it('should handle database errors', async () => {
      mockSupabase.range = vi.fn().mockResolvedValue({
        data: null,
        count: 0,
        error: { message: 'Database error' },
      })

      const result = await getClients()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getClientById', () => {
    it('should return a client by ID', async () => {
      const mockClient = {
        client_id: '1',
        company_name: 'Test Company',
        email: 'test@example.com',
      }

      mockSupabase.single = vi.fn().mockResolvedValue({ data: mockClient, error: null })

      const result = await getClientById('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockClient)
      expect(mockSupabase.eq).toHaveBeenCalledWith('client_id', '1')
    })

    it('should handle client not found', async () => {
      mockSupabase.single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Client not found' },
      })

      const result = await getClientById('nonexistent')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('createClient', () => {
    it('should create a new client successfully', async () => {
      const newClient = {
        company_name: 'New Company',
        email: 'new@example.com',
        contact_person: 'John Doe',
        preferred_language: 'es' as const,
      }

      const createdClient = { client_id: '123', ...newClient }

      // First call: check if email exists (returns null - doesn't exist)
      // Second call: insert returns the created client
      mockSupabase.single = vi.fn()
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // Email doesn't exist
        .mockResolvedValueOnce({ data: createdClient, error: null }) // Insert succeeds

      const result = await createClient(newClient)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdClient)
      expect(mockSupabase.insert).toHaveBeenCalled()
    })

    it('should reject invalid email format', async () => {
      const invalidClient = {
        company_name: 'New Company',
        email: 'invalid-email',
        preferred_language: 'es' as const,
      }

      const result = await createClient(invalidClient)

      expect(result.success).toBe(false)
      // Zod validation should catch this
    })

    it('should reject duplicate email', async () => {
      const newClient = {
        company_name: 'New Company',
        email: 'existing@example.com',
        preferred_language: 'es' as const,
      }

      // Email already exists
      mockSupabase.single = vi.fn()
        .mockResolvedValueOnce({ data: { client_id: 'existing-123' }, error: null })

      const result = await createClient(newClient)

      expect(result.success).toBe(false)
      expect(result.error).toContain('email')
    })
  })

  describe('updateClient', () => {
    it('should update a client successfully', async () => {
      const updates = {
        company_name: 'Updated Company',
        email: 'test@example.com',
        preferred_language: 'es' as const,
      }
      const updatedClient = {
        client_id: '1',
        ...updates,
      }

      // First: check if email exists for another client (no duplicate)
      // Second: update succeeds
      mockSupabase.single = vi.fn()
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // No duplicate
        .mockResolvedValueOnce({ data: updatedClient, error: null }) // Update succeeds

      const result = await updateClient('1', updates)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedClient)
      expect(mockSupabase.update).toHaveBeenCalled()
    })
  })

  describe('deleteClient', () => {
    it('should delete a client without active projects', async () => {
      // Mock count projects - the query ends with .eq('archived', false)
      // which returns { count: 0 }
      mockSupabase.eq = vi.fn(() => mockSupabase)
      // First chain of eq calls for checking projects, returns count: 0
      mockSupabase.eq.mockImplementation(() => {
        return {
          ...mockSupabase,
          then: (resolve: Function) => resolve({ count: 0, error: null }),
        }
      })

      const result = await deleteClient('1')

      expect(result.success).toBe(true)
    })

    it('should block deletion when client has active projects', async () => {
      // Mock count returns 3 active projects
      mockSupabase.eq = vi.fn(() => mockSupabase)
      mockSupabase.eq.mockImplementation(() => {
        return {
          ...mockSupabase,
          then: (resolve: Function) => resolve({ count: 3, error: null }),
        }
      })

      const result = await deleteClient('1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('proyectos activos')
    })
  })
})
