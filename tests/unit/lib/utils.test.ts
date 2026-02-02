import { describe, it, expect } from 'vitest'
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  isDeadlineNear,
  isDeadlineOverdue,
  getDaysUntilDeadline,
  getInitials,
  truncate,
  canTransitionTo,
  calculateQuoteTotals,
  generateOptimisticId,
  STATUS_LABELS,
  PRIORITY_LABELS,
  LANGUAGE_LABELS,
} from '@/lib/utils'

describe('Utils', () => {
  describe('cn (classnames merger)', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
      expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
    })

    it('should merge tailwind classes correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle arrays', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('should handle objects', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
    })
  })

  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      const result = formatCurrency(1234.56)
      // Different environments may format differently (1.234,56 € or 1234,56 €)
      expect(result).toMatch(/1\.?234,56/)
      expect(result).toContain('€')
    })

    it('should format zero correctly', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0,00')
      expect(result).toContain('€')
    })

    it('should format negative amounts correctly', () => {
      const result = formatCurrency(-500)
      expect(result).toContain('500,00')
    })

    it('should format large amounts correctly', () => {
      const result = formatCurrency(1000000)
      // Different environments may format differently
      expect(result).toMatch(/1\.?000\.?000,00/)
      expect(result).toContain('€')
    })

    it('should handle decimal precision', () => {
      const result = formatCurrency(99.999)
      // Should round to 2 decimal places
      expect(result).toMatch(/100,00|99,99/)
    })
  })

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2026-01-15')
      expect(result).toMatch(/15.*ene.*2026/i)
    })

    it('should format Date object correctly', () => {
      const date = new Date(2026, 5, 20) // June 20, 2026
      const result = formatDate(date)
      expect(result).toMatch(/20.*jun.*2026/i)
    })
  })

  describe('formatDateTime', () => {
    it('should include time in the format', () => {
      const date = new Date(2026, 0, 15, 14, 30)
      const result = formatDateTime(date)
      expect(result).toContain('14:30')
    })
  })

  describe('formatRelativeTime', () => {
    it('should return relative time string', () => {
      const recentDate = new Date(Date.now() - 60000) // 1 minute ago
      const result = formatRelativeTime(recentDate)
      expect(result).toMatch(/hace|minuto|segundo/i)
    })
  })

  describe('isDeadlineNear', () => {
    it('should return true for deadlines within 7 days', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(isDeadlineNear(tomorrow.toISOString())).toBe(true)
    })

    it('should return true for deadlines exactly 7 days away', () => {
      const sevenDays = new Date()
      sevenDays.setDate(sevenDays.getDate() + 7)
      expect(isDeadlineNear(sevenDays.toISOString())).toBe(true)
    })

    it('should return false for deadlines more than 7 days away', () => {
      const farAway = new Date()
      farAway.setDate(farAway.getDate() + 30)
      expect(isDeadlineNear(farAway.toISOString())).toBe(false)
    })

    it('should return false for past deadlines', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isDeadlineNear(yesterday.toISOString())).toBe(false)
    })

    it('should return false for null deadline', () => {
      expect(isDeadlineNear(null)).toBe(false)
    })
  })

  describe('isDeadlineOverdue', () => {
    it('should return true for past deadlines', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isDeadlineOverdue(yesterday.toISOString())).toBe(true)
    })

    it('should return false for future deadlines', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(isDeadlineOverdue(tomorrow.toISOString())).toBe(false)
    })

    it('should return false for null deadline', () => {
      expect(isDeadlineOverdue(null)).toBe(false)
    })
  })

  describe('getDaysUntilDeadline', () => {
    it('should return positive number for future deadlines', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      const days = getDaysUntilDeadline(futureDate.toISOString())
      expect(days).toBe(5)
    })

    it('should return negative number for past deadlines', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 3)
      const days = getDaysUntilDeadline(pastDate.toISOString())
      expect(days).toBe(-3)
    })

    it('should return null for null deadline', () => {
      expect(getDaysUntilDeadline(null)).toBe(null)
    })
  })

  describe('getInitials', () => {
    it('should return initials for single word', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should return initials for two words', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should return max 2 initials for multiple words', () => {
      expect(getInitials('John Michael Doe')).toBe('JM')
    })

    it('should handle lowercase', () => {
      expect(getInitials('john doe')).toBe('JD')
    })

    it('should handle company names', () => {
      expect(getInitials('Acme Corporation')).toBe('AC')
    })
  })

  describe('truncate', () => {
    it('should not truncate short text', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })

    it('should truncate long text with ellipsis', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...')
    })

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('')
    })
  })

  describe('canTransitionTo', () => {
    it('should allow backlog to proposal', () => {
      expect(canTransitionTo('backlog', 'proposal')).toBe(true)
    })

    it('should allow backlog to cancelled', () => {
      expect(canTransitionTo('backlog', 'cancelled')).toBe(true)
    })

    it('should not allow backlog to completed', () => {
      expect(canTransitionTo('backlog', 'completed')).toBe(false)
    })

    it('should not allow completed to anything', () => {
      expect(canTransitionTo('completed', 'backlog')).toBe(false)
      expect(canTransitionTo('completed', 'in_progress')).toBe(false)
    })

    it('should allow cancelled to backlog', () => {
      expect(canTransitionTo('cancelled', 'backlog')).toBe(true)
    })

    it('should allow same status (no change)', () => {
      expect(canTransitionTo('in_progress', 'in_progress')).toBe(true)
    })

    it('should allow testing to completed', () => {
      expect(canTransitionTo('testing', 'completed')).toBe(true)
    })

    it('should allow testing back to in_progress', () => {
      expect(canTransitionTo('testing', 'in_progress')).toBe(true)
    })
  })

  describe('calculateQuoteTotals', () => {
    it('should calculate totals correctly', () => {
      const services = [
        { hours: 10, hourly_rate: 100 },
        { hours: 20, hourly_rate: 75 },
      ]
      const result = calculateQuoteTotals(services)

      expect(result.subtotal).toBe(2500) // (10*100) + (20*75)
      expect(result.iva).toBe(525) // 2500 * 0.21
      expect(result.total).toBe(3025) // 2500 + 525
    })

    it('should handle empty services array', () => {
      const result = calculateQuoteTotals([])

      expect(result.subtotal).toBe(0)
      expect(result.iva).toBe(0)
      expect(result.total).toBe(0)
    })

    it('should handle single service', () => {
      const services = [{ hours: 8, hourly_rate: 50 }]
      const result = calculateQuoteTotals(services)

      expect(result.subtotal).toBe(400)
      expect(result.iva).toBe(84)
      expect(result.total).toBe(484)
    })
  })

  describe('generateOptimisticId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateOptimisticId()
      const id2 = generateOptimisticId()

      expect(id1).not.toBe(id2)
    })

    it('should start with temp-', () => {
      const id = generateOptimisticId()
      expect(id.startsWith('temp-')).toBe(true)
    })

    it('should be a string', () => {
      const id = generateOptimisticId()
      expect(typeof id).toBe('string')
    })
  })

  describe('Constants', () => {
    it('should have all status labels', () => {
      expect(STATUS_LABELS.backlog).toBe('Backlog')
      expect(STATUS_LABELS.proposal).toBe('Propuesta')
      expect(STATUS_LABELS.approved).toBe('Aprobado')
      expect(STATUS_LABELS.in_progress).toBe('En Progreso')
      expect(STATUS_LABELS.testing).toBe('Testing')
      expect(STATUS_LABELS.completed).toBe('Completado')
      expect(STATUS_LABELS.cancelled).toBe('Cancelado')
    })

    it('should have all priority labels', () => {
      expect(PRIORITY_LABELS.low).toBe('Baja')
      expect(PRIORITY_LABELS.medium).toBe('Media')
      expect(PRIORITY_LABELS.high).toBe('Alta')
      expect(PRIORITY_LABELS.urgent).toBe('Urgente')
    })

    it('should have all language labels', () => {
      expect(LANGUAGE_LABELS.es).toBe('Español')
      expect(LANGUAGE_LABELS.en).toBe('English')
      expect(LANGUAGE_LABELS.ca).toBe('Català')
    })
  })
})
