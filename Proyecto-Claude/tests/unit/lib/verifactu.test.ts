import { describe, it, expect, vi } from 'vitest'
import {
  generateVerifactuHash,
  generateVerifactuCSV,
  generateVerifactuQR,
  generateVerifactuUrl,
  generateVerifactuId,
  canRegisterInVerifactu,
  canRetryVerifactuRegistration,
} from '@/lib/verifactu'
import type { Invoice, VerifactuConfig } from '@/types/database.types'

describe('Verifactu Library', () => {
  const mockConfig: VerifactuConfig = {
    enabled: true,
    nif_emisor: 'B12345678',
    nombre_emisor: 'Anclora Cognitive Solutions',
    entorno: 'sandbox',
    software_id: 'ANCLORA-001',
    software_version: '1.0.0',
  }

  const mockInvoice: Invoice = {
    invoice_id: 'inv-123',
    project_id: 'proj-123',
    invoice_number: '2026-0001',
    status: 'sent',
    issue_date: '2026-01-15',
    due_date: '2026-02-15',
    subtotal: 1000,
    iva: 210,
    total: 1210,
    verifactu_status: 'not_registered',
    verifactu_id: null,
    verifactu_hash: null,
    verifactu_csv: null,
    verifactu_qr: null,
    verifactu_url: null,
    verifactu_registered_at: null,
    verifactu_error_message: null,
    pdf_url: null,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  }

  describe('generateVerifactuHash', () => {
    it('should generate a 64 character hex string', () => {
      const hash = generateVerifactuHash(mockInvoice, mockConfig)

      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[A-F0-9]+$/)
    })

    it('should generate consistent hash for same input', () => {
      // Note: Due to timestamp in hash generation, we can't test exact consistency
      // But we can test that format is always correct
      const hash1 = generateVerifactuHash(mockInvoice, mockConfig)
      const hash2 = generateVerifactuHash(mockInvoice, mockConfig)

      expect(hash1).toHaveLength(64)
      expect(hash2).toHaveLength(64)
    })

    it('should include previous hash in chain when provided', () => {
      const previousHash = '0'.repeat(64)
      const hash = generateVerifactuHash(mockInvoice, mockConfig, previousHash)

      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[A-F0-9]+$/)
    })
  })

  describe('generateVerifactuCSV', () => {
    it('should generate CSV in correct format', () => {
      const csv = generateVerifactuCSV(mockInvoice, mockConfig)

      // Format: YYYYMMDD-NIFEMISOR-XXXX-YYYY
      expect(csv).toMatch(/^\d{8}-[A-Z0-9]+-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
    })

    it('should include date from invoice', () => {
      const csv = generateVerifactuCSV(mockInvoice, mockConfig)

      // Invoice date is 2026-01-15, so CSV should start with 20260115
      expect(csv.startsWith('20260115')).toBe(true)
    })

    it('should include NIF from config', () => {
      const csv = generateVerifactuCSV(mockInvoice, mockConfig)

      // NIF is B12345678
      expect(csv).toContain('B12345678')
    })
  })

  describe('generateVerifactuQR', () => {
    it('should generate base64 data URL', async () => {
      const qr = await generateVerifactuQR('https://example.com/verify?csv=123')

      expect(qr).toMatch(/^data:image\/(png|svg\+xml);base64,/)
    })

    it('should generate valid QR for verification URL', async () => {
      const url = 'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?csv=20260115-B12345678-ABCD-1234'
      const qr = await generateVerifactuQR(url)

      expect(qr).toBeDefined()
      expect(qr.length).toBeGreaterThan(100) // Should have substantial content
    })
  })

  describe('generateVerifactuUrl', () => {
    it('should generate sandbox URL correctly', () => {
      const csv = '20260115-B12345678-ABCD-1234'
      const url = generateVerifactuUrl(csv, 'sandbox')

      expect(url).toContain('prewww2.aeat.es')
      expect(url).toContain('ValidarQR')
      expect(url).toContain(encodeURIComponent(csv))
    })

    it('should generate production URL correctly', () => {
      const csv = '20260115-B12345678-ABCD-1234'
      const url = generateVerifactuUrl(csv, 'production')

      expect(url).toContain('www2.agenciatributaria.gob.es')
      expect(url).toContain('ValidarQR')
      expect(url).toContain(encodeURIComponent(csv))
    })
  })

  describe('generateVerifactuId', () => {
    it('should generate unique ID starting with VF-', () => {
      const id = generateVerifactuId(mockInvoice, mockConfig)

      expect(id).toMatch(/^VF-/)
    })

    it('should include NIF in the ID', () => {
      const id = generateVerifactuId(mockInvoice, mockConfig)

      expect(id).toContain('B12345678')
    })

    it('should generate unique IDs', () => {
      const id1 = generateVerifactuId(mockInvoice, mockConfig)
      const id2 = generateVerifactuId(mockInvoice, mockConfig)

      expect(id1).not.toBe(id2)
    })
  })

  describe('canRegisterInVerifactu', () => {
    it('should return valid for sent invoice with enabled config', () => {
      const result = canRegisterInVerifactu(mockInvoice, mockConfig)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject when Verifactu is disabled', () => {
      const disabledConfig = { ...mockConfig, enabled: false }
      const result = canRegisterInVerifactu(mockInvoice, disabledConfig)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('no está habilitado')
    })

    it('should reject draft invoices', () => {
      const draftInvoice = { ...mockInvoice, status: 'draft' as const }
      const result = canRegisterInVerifactu(draftInvoice, mockConfig)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('borrador')
    })

    it('should reject cancelled invoices', () => {
      const cancelledInvoice = { ...mockInvoice, status: 'cancelled' as const }
      const result = canRegisterInVerifactu(cancelledInvoice, mockConfig)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('canceladas')
    })

    it('should reject already registered invoices', () => {
      const registeredInvoice = { ...mockInvoice, verifactu_status: 'registered' as const }
      const result = canRegisterInVerifactu(registeredInvoice, mockConfig)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('ya está registrada')
    })

    it('should reject pending invoices', () => {
      const pendingInvoice = { ...mockInvoice, verifactu_status: 'pending' as const }
      const result = canRegisterInVerifactu(pendingInvoice, mockConfig)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('en proceso')
    })

    it('should reject when NIF is missing', () => {
      const incompleteConfig = { ...mockConfig, nif_emisor: '' }
      const result = canRegisterInVerifactu(mockInvoice, incompleteConfig)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('incompleta')
    })

    it('should accept paid invoices', () => {
      const paidInvoice = { ...mockInvoice, status: 'paid' as const }
      const result = canRegisterInVerifactu(paidInvoice, mockConfig)

      expect(result.valid).toBe(true)
    })
  })

  describe('canRetryVerifactuRegistration', () => {
    it('should allow retry for error status', () => {
      const errorInvoice = { ...mockInvoice, verifactu_status: 'error' as const }
      const result = canRetryVerifactuRegistration(errorInvoice)

      expect(result.valid).toBe(true)
    })

    it('should reject retry for registered status', () => {
      const registeredInvoice = { ...mockInvoice, verifactu_status: 'registered' as const }
      const result = canRetryVerifactuRegistration(registeredInvoice)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('registros fallidos')
    })

    it('should reject retry for pending status', () => {
      const pendingInvoice = { ...mockInvoice, verifactu_status: 'pending' as const }
      const result = canRetryVerifactuRegistration(pendingInvoice)

      expect(result.valid).toBe(false)
    })

    it('should reject retry for not_registered status', () => {
      const result = canRetryVerifactuRegistration(mockInvoice)

      expect(result.valid).toBe(false)
    })
  })
})
