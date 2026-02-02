import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Mock modules before importing actions
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/utils', () => ({
  canTransitionTo: vi.fn((from: string, to: string) => {
    const validTransitions: Record<string, string[]> = {
      backlog: ['proposal', 'cancelled'],
      proposal: ['backlog', 'approved', 'cancelled'],
      approved: ['in_progress', 'cancelled'],
      in_progress: ['testing', 'cancelled'],
      testing: ['in_progress', 'completed', 'cancelled'],
      completed: [],
      cancelled: ['backlog'],
    }
    return validTransitions[from]?.includes(to) ?? false
  }),
}))

import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  updateProjectStatus,
  archiveProject,
  deleteProject,
} from '@/app/actions/projects'

describe('Project Actions', () => {
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

  describe('getProjects', () => {
    it('should return projects successfully', async () => {
      const mockProjects = [
        {
          project_id: '1',
          project_name: 'Test Project',
          status: 'backlog',
          clients: { company_name: 'Test Co', email: 'test@example.com' },
        },
      ]

      mockSupabase.order = vi.fn().mockResolvedValue({ data: mockProjects, error: null })

      const result = await getProjects()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProjects)
      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
    })

    it('should filter by status', async () => {
      mockSupabase.order = vi.fn().mockResolvedValue({ data: [], error: null })

      await getProjects({ status: 'in_progress' })

      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'in_progress')
    })

    it('should exclude archived projects by default', async () => {
      mockSupabase.order = vi.fn().mockResolvedValue({ data: [], error: null })

      await getProjects()

      expect(mockSupabase.eq).toHaveBeenCalledWith('archived', false)
    })

    it('should handle database errors', async () => {
      mockSupabase.order = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const result = await getProjects()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getProjectById', () => {
    it('should return a project with client data', async () => {
      const mockProject = {
        project_id: '1',
        project_name: 'Test Project',
        status: 'backlog',
        clients: { client_id: '1', company_name: 'Test Co' },
      }

      mockSupabase.single = vi.fn().mockResolvedValue({ data: mockProject, error: null })

      const result = await getProjectById('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProject)
      expect(mockSupabase.select).toHaveBeenCalledWith('*, clients(*)')
    })
  })

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const newProject = {
        project_name: 'New Project',
        client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Valid UUID
        status: 'backlog' as const,
        priority: 'medium' as const,
      }

      const createdProject = { project_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', ...newProject }

      mockSupabase.single = vi.fn().mockResolvedValue({ data: createdProject, error: null })

      const result = await createProject(newProject)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdProject)
    })

    it('should reject project without name', async () => {
      const invalidProject = {
        project_name: '',
        client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        status: 'backlog' as const,
        priority: 'medium' as const,
      }

      const result = await createProject(invalidProject)

      expect(result.success).toBe(false)
    })
  })

  describe('updateProjectStatus', () => {
    it('should update status with valid transition', async () => {
      // Mock getting current status
      mockSupabase.single = vi.fn()
        .mockResolvedValueOnce({ data: { status: 'backlog' }, error: null })
        .mockResolvedValueOnce({
          data: { project_id: '1', status: 'proposal' },
          error: null,
        })

      const result = await updateProjectStatus('1', 'proposal')

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('proposal')
    })

    it('should reject invalid status transition', async () => {
      // Mock getting current status
      mockSupabase.single = vi.fn().mockResolvedValueOnce({
        data: { status: 'backlog' },
        error: null,
      })

      // backlog -> completed is not allowed
      const result = await updateProjectStatus('1', 'completed')

      expect(result.success).toBe(false)
      expect(result.error).toContain('No se puede cambiar')
    })
  })

  describe('archiveProject', () => {
    it('should archive a project', async () => {
      mockSupabase.eq = vi.fn(() => mockSupabase)
      mockSupabase.eq.mockResolvedValueOnce({ error: null })

      const result = await archiveProject('1')

      expect(result.success).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalled()
    })
  })

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      mockSupabase.eq = vi.fn(() => mockSupabase)
      mockSupabase.eq.mockResolvedValueOnce({ error: null })

      const result = await deleteProject('1')

      expect(result.success).toBe(true)
      expect(mockSupabase.delete).toHaveBeenCalled()
    })

    it('should handle deletion errors', async () => {
      mockSupabase.eq = vi.fn(() => mockSupabase)
      mockSupabase.eq.mockResolvedValueOnce({
        error: { message: 'Foreign key constraint violation' },
      })

      const result = await deleteProject('1')

      expect(result.success).toBe(false)
    })
  })
})
