/**
 * Verifactu Integration Library
 *
 * This module provides functions to generate and simulate Verifactu data
 * for invoice registration with the Spanish Tax Agency (AEAT).
 *
 * Note: This is a simulation module. Real API integration should replace
 * the simulated functions when connecting to the actual Verifactu API.
 */

import QRCode from 'qrcode'
import type {
  Invoice,
  InvoiceWithProject,
  VerifactuConfig,
  VerifactuRegistrationData
} from '@/types/database.types'

// Verifactu API payload structure (simplified for simulation)
export interface VerifactuInvoicePayload {
  IDFactura: {
    IDEmisorFactura: string
    NumSerieFactura: string
    FechaExpedicionFactura: string
  }
  TipoFactura: string
  DescripcionOperacion: string
  ImporteTotal: string
  BaseImponible: string
  CuotaRepercutida: string
  TipoImpositivo: string
  NombreRazonDestinatario: string
  NIFDestinatario: string
  Huella: string
  FechaHoraHusoGenRegistro: string
  SoftwareID: string
  VersionSoftware: string
}

/**
 * Generates a SHA-256 hash of the invoice data for Verifactu
 * This hash ensures data integrity and prevents tampering
 */
export function generateVerifactuHash(
  invoice: Invoice | InvoiceWithProject,
  config: VerifactuConfig,
  previousHash?: string
): string {
  // Create a deterministic string from invoice data
  const dataToHash = [
    config.nif_emisor,
    invoice.invoice_number,
    invoice.issue_date,
    invoice.total.toFixed(2),
    invoice.subtotal.toFixed(2),
    invoice.iva.toFixed(2),
    previousHash || '0'.repeat(64), // Chain with previous invoice hash
    new Date().toISOString(),
  ].join('|')

  // Simulate SHA-256 hash (in production, use crypto.subtle.digest)
  // This creates a deterministic 64-character hex string
  let hash = ''
  for (let i = 0; i < 64; i++) {
    const charCode = dataToHash.charCodeAt(i % dataToHash.length)
    hash += ((charCode * (i + 1) * 17) % 16).toString(16)
  }

  return hash.toUpperCase()
}

/**
 * Generates the CSV (Código Seguro de Verificación)
 * Format: YYYYMMDD-NIFEMISOR-XXXX-YYYY
 */
export function generateVerifactuCSV(
  invoice: Invoice | InvoiceWithProject,
  config: VerifactuConfig
): string {
  const date = new Date(invoice.issue_date)
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')

  // Generate random alphanumeric segments
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segment1 = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
  const segment2 = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')

  return `${dateStr}-${config.nif_emisor.replace(/[^A-Z0-9]/gi, '').slice(0, 9)}-${segment1}-${segment2}`
}

/**
 * Generates a QR code as a base64 data URL
 * The QR contains the verification URL for the invoice
 */
export async function generateVerifactuQR(verificationUrl: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return qrDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    // Return a fallback placeholder if QR generation fails
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" font-size="12" fill="#666">Error QR</text>
    </svg>`
    return `data:image/svg+xml;base64,${Buffer.from(fallbackSvg).toString('base64')}`
  }
}

/**
 * Generates the AEAT verification URL
 */
export function generateVerifactuUrl(csv: string, entorno: 'sandbox' | 'production'): string {
  const baseUrl = entorno === 'production'
    ? 'https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR'
    : 'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR'

  return `${baseUrl}?csv=${encodeURIComponent(csv)}`
}

/**
 * Generates a unique Verifactu ID for the registration
 */
export function generateVerifactuId(
  invoice: Invoice | InvoiceWithProject,
  config: VerifactuConfig
): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `VF-${config.nif_emisor.slice(0, 9)}-${timestamp}-${random}`
}

/**
 * Transforms an invoice to Verifactu payload format
 */
export function transformInvoiceToVerifactu(
  invoice: InvoiceWithProject,
  config: VerifactuConfig,
  hash: string
): VerifactuInvoicePayload {
  const client = invoice.projects?.clients

  return {
    IDFactura: {
      IDEmisorFactura: config.nif_emisor,
      NumSerieFactura: invoice.invoice_number,
      FechaExpedicionFactura: formatDateForVerifactu(invoice.issue_date),
    },
    TipoFactura: 'F1', // Factura ordinaria
    DescripcionOperacion: 'Prestación de servicios profesionales',
    ImporteTotal: invoice.total.toFixed(2),
    BaseImponible: invoice.subtotal.toFixed(2),
    CuotaRepercutida: invoice.iva.toFixed(2),
    TipoImpositivo: '21.00', // 21% IVA
    NombreRazonDestinatario: client?.company_name || 'Cliente',
    NIFDestinatario: client?.nif_cif || '',
    Huella: hash,
    FechaHoraHusoGenRegistro: new Date().toISOString(),
    SoftwareID: config.software_id,
    VersionSoftware: config.software_version,
  }
}

/**
 * Formats a date string to Verifactu format (DD-MM-YYYY)
 */
function formatDateForVerifactu(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

/**
 * Main function to generate all Verifactu data for an invoice
 * This simulates the registration process
 */
export async function generateVerifactuData(
  invoice: InvoiceWithProject,
  config: VerifactuConfig,
  previousHash?: string
): Promise<VerifactuRegistrationData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Generate hash
  const hash = generateVerifactuHash(invoice, config, previousHash)

  // Generate CSV
  const csv = generateVerifactuCSV(invoice, config)

  // Generate verification URL
  const url = generateVerifactuUrl(csv, config.entorno)

  // Generate QR code
  const qr = await generateVerifactuQR(url)

  // Generate Verifactu ID
  const verifactuId = generateVerifactuId(invoice, config)

  return {
    hash,
    csv,
    qr,
    url,
    verifactuId,
  }
}

/**
 * Validates if an invoice can be registered in Verifactu
 */
export function canRegisterInVerifactu(
  invoice: Invoice | InvoiceWithProject,
  config: VerifactuConfig
): { valid: boolean; error?: string } {
  // Check if Verifactu is enabled
  if (!config.enabled) {
    return { valid: false, error: 'Verifactu no está habilitado en la configuración' }
  }

  // Check if config has required fields
  if (!config.nif_emisor || !config.nombre_emisor) {
    return { valid: false, error: 'Configuración de Verifactu incompleta (NIF/Nombre emisor)' }
  }

  // Check invoice status - only sent or paid invoices can be registered
  if (invoice.status === 'draft') {
    return { valid: false, error: 'Las facturas en borrador no pueden registrarse en Verifactu' }
  }

  if (invoice.status === 'cancelled') {
    return { valid: false, error: 'Las facturas canceladas no pueden registrarse en Verifactu' }
  }

  // Check if already registered
  if (invoice.verifactu_status === 'registered') {
    return { valid: false, error: 'Esta factura ya está registrada en Verifactu' }
  }

  // Check if registration is pending
  if (invoice.verifactu_status === 'pending') {
    return { valid: false, error: 'El registro de esta factura está en proceso' }
  }

  return { valid: true }
}

/**
 * Validates if a failed registration can be retried
 */
export function canRetryVerifactuRegistration(
  invoice: Invoice | InvoiceWithProject
): { valid: boolean; error?: string } {
  if (invoice.verifactu_status !== 'error') {
    return { valid: false, error: 'Solo se pueden reintentar registros fallidos' }
  }

  return { valid: true }
}
