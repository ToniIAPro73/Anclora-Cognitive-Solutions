import { vi } from 'vitest'

export function createMockSupabaseClient() {
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    // These are the terminal methods that return promises
    then: vi.fn(),
  }

  // Make order return a promise by default (for getClients-style queries)
  mockQueryBuilder.order.mockImplementation(() => {
    const chainable = { ...mockQueryBuilder }
    // Return a promise-like object
    return {
      ...chainable,
      then: (resolve: Function) => resolve({ data: [], error: null }),
    }
  })

  const mockClient = {
    from: vi.fn(() => mockQueryBuilder),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
  }

  return { mockClient, mockQueryBuilder }
}

// Helper to set up successful query response
export function mockQueryResponse(
  mockQueryBuilder: ReturnType<typeof createMockSupabaseClient>['mockQueryBuilder'],
  data: unknown,
  error: unknown = null
) {
  // For queries ending with .order()
  mockQueryBuilder.order.mockResolvedValueOnce({ data, error })
  // For queries ending with .single()
  mockQueryBuilder.single.mockResolvedValueOnce({ data, error })
  // For queries ending with .eq()
  mockQueryBuilder.eq.mockResolvedValueOnce({ data, error })
}
