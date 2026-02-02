/**
 * Email Service using Resend
 */

import { EMAIL_CONFIG, EMAIL_TEMPLATES } from './config'
import {
  generateQuoteEmail,
  generateInvoiceEmail,
  generateReminderEmail,
  type QuoteEmailData,
  type InvoiceEmailData,
  type ReminderEmailData,
} from './templates'

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('RESEND_API_KEY not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        reply_to: EMAIL_CONFIG.replyTo,
        subject: payload.subject,
        html: payload.html,
        attachments: payload.attachments?.map(att => ({
          filename: att.filename,
          content: typeof att.content === 'string'
            ? att.content
            : att.content.toString('base64'),
        })),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

export async function sendQuoteEmail(
  to: string,
  data: QuoteEmailData,
  pdfBuffer?: Buffer
): Promise<SendEmailResult> {
  const html = generateQuoteEmail(data)
  const subject = EMAIL_TEMPLATES.quote.subject(data.projectName, data.version)

  const attachments = pdfBuffer
    ? [{
        filename: `presupuesto-${data.projectName.replace(/[^a-zA-Z0-9]/g, '-')}-v${data.version}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }]
    : undefined

  return sendEmail({ to, subject, html, attachments })
}

export async function sendInvoiceEmail(
  to: string,
  data: InvoiceEmailData,
  pdfBuffer?: Buffer
): Promise<SendEmailResult> {
  const html = generateInvoiceEmail(data)
  const subject = EMAIL_TEMPLATES.invoice.subject(data.invoiceNumber)

  const attachments = pdfBuffer
    ? [{
        filename: `factura-${data.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }]
    : undefined

  return sendEmail({ to, subject, html, attachments })
}

export async function sendReminderEmail(
  to: string,
  data: ReminderEmailData
): Promise<SendEmailResult> {
  const html = generateReminderEmail(data)
  const subject = EMAIL_TEMPLATES.reminder.subject(data.invoiceNumber)

  return sendEmail({ to, subject, html })
}

// Re-export types
export type { QuoteEmailData, InvoiceEmailData, ReminderEmailData }
