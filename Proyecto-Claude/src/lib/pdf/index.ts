export { InvoicePDF } from './invoice-template'
export { QuotePDF } from './quote-template'
export { styles, colors, companyInfo } from './styles'

/**
 * Download invoice PDF
 */
export async function downloadInvoicePDF(invoiceId: string, invoiceNumber: string) {
  try {
    const response = await fetch(`/api/pdf/invoice/${invoiceId}`)

    if (!response.ok) {
      throw new Error('Error al generar PDF')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `factura-${invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading invoice PDF:', error)
    throw error
  }
}

/**
 * Download quote PDF
 */
export async function downloadQuotePDF(quoteId: string, projectName: string, version: number) {
  try {
    const response = await fetch(`/api/pdf/quote/${quoteId}`)

    if (!response.ok) {
      throw new Error('Error al generar PDF')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const safeName = projectName.replace(/[^a-zA-Z0-9]/g, '-')
    link.download = `${safeName}-v${version}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading quote PDF:', error)
    throw error
  }
}

/**
 * Open PDF in new tab for preview
 */
export async function previewPDF(type: 'invoice' | 'quote', id: string) {
  const url = `/api/pdf/${type}/${id}`
  window.open(url, '_blank')
}
