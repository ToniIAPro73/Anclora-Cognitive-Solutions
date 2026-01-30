/**
 * HTML Email Templates
 */

import { EMAIL_CONFIG } from './config'

const baseStyles = `
  body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f5f5f0; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
  .header { background-color: #192350; padding: 30px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
  .content { padding: 40px 30px; }
  .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
  .btn { display: inline-block; padding: 12px 30px; background-color: #192350; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  .btn:hover { background-color: #2a3a70; }
  .info-box { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .amount { font-size: 28px; font-weight: 700; color: #192350; }
  .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
  .highlight { color: #D4AF37; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  th { background-color: #f8f9fa; font-weight: 600; }
`

function wrapInLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${EMAIL_CONFIG.company.name}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>${EMAIL_CONFIG.company.name}</p>
      <p>${EMAIL_CONFIG.company.address} • ${EMAIL_CONFIG.company.city}</p>
      <p>${EMAIL_CONFIG.company.phone} • <a href="${EMAIL_CONFIG.company.website}">${EMAIL_CONFIG.company.website}</a></p>
    </div>
  </div>
</body>
</html>
`
}

export interface QuoteEmailData {
  clientName: string
  contactPerson?: string
  projectName: string
  version: number
  total: string
  validUntil: string
  portalUrl: string
  customMessage?: string
}

export function generateQuoteEmail(data: QuoteEmailData): string {
  const greeting = data.contactPerson
    ? `Estimado/a ${data.contactPerson}`
    : `Estimado/a cliente`

  const content = `
    <p>${greeting},</p>

    <p>Nos complace enviarle el presupuesto para el proyecto <strong>${data.projectName}</strong>.</p>

    ${data.customMessage ? `<p>${data.customMessage}</p>` : ''}

    <div class="info-box">
      <p style="margin: 0 0 10px 0; color: #6b7280;">Importe total (IVA incluido)</p>
      <p class="amount">${data.total}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
        Versión ${data.version} • Válido hasta ${data.validUntil}
      </p>
    </div>

    <p>Puede revisar el presupuesto completo y descargarlo en PDF accediendo a su portal de cliente:</p>

    <p style="text-align: center;">
      <a href="${data.portalUrl}" class="btn">Ver presupuesto</a>
    </p>

    <div class="divider"></div>

    <p>Si tiene alguna pregunta o desea discutir los detalles, no dude en contactarnos.</p>

    <p>Atentamente,<br>
    <strong>El equipo de ${EMAIL_CONFIG.company.name}</strong></p>
  `

  return wrapInLayout(content)
}

export interface InvoiceEmailData {
  clientName: string
  contactPerson?: string
  invoiceNumber: string
  projectName: string
  issueDate: string
  dueDate: string
  total: string
  portalUrl: string
  customMessage?: string
}

export function generateInvoiceEmail(data: InvoiceEmailData): string {
  const greeting = data.contactPerson
    ? `Estimado/a ${data.contactPerson}`
    : `Estimado/a cliente`

  const content = `
    <p>${greeting},</p>

    <p>Adjunto encontrará la factura <strong>${data.invoiceNumber}</strong> correspondiente al proyecto <strong>${data.projectName}</strong>.</p>

    ${data.customMessage ? `<p>${data.customMessage}</p>` : ''}

    <div class="info-box">
      <table>
        <tr>
          <td style="border: none; padding: 5px 0;"><strong>Número de factura:</strong></td>
          <td style="border: none; padding: 5px 0; text-align: right;">${data.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 5px 0;"><strong>Fecha de emisión:</strong></td>
          <td style="border: none; padding: 5px 0; text-align: right;">${data.issueDate}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 5px 0;"><strong>Fecha de vencimiento:</strong></td>
          <td style="border: none; padding: 5px 0; text-align: right;">${data.dueDate}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 15px 0 5px 0;"><strong>Total a pagar:</strong></td>
          <td style="border: none; padding: 15px 0 5px 0; text-align: right;" class="amount">${data.total}</td>
        </tr>
      </table>
    </div>

    <p>Puede descargar la factura en PDF desde su portal de cliente:</p>

    <p style="text-align: center;">
      <a href="${data.portalUrl}" class="btn">Ver factura</a>
    </p>

    <div class="divider"></div>

    <p><strong>Datos para el pago:</strong></p>
    <ul>
      <li>Titular: ${EMAIL_CONFIG.company.name}</li>
      <li>IBAN: ES12 1234 5678 9012 3456 7890</li>
      <li>Concepto: ${data.invoiceNumber}</li>
    </ul>

    <p>Gracias por su confianza.</p>

    <p>Atentamente,<br>
    <strong>El equipo de ${EMAIL_CONFIG.company.name}</strong></p>
  `

  return wrapInLayout(content)
}

export interface ReminderEmailData {
  clientName: string
  contactPerson?: string
  invoiceNumber: string
  dueDate: string
  daysOverdue: number
  total: string
  portalUrl: string
}

export function generateReminderEmail(data: ReminderEmailData): string {
  const greeting = data.contactPerson
    ? `Estimado/a ${data.contactPerson}`
    : `Estimado/a cliente`

  const urgencyText = data.daysOverdue > 14
    ? 'Le rogamos que regularice esta situación a la mayor brevedad posible.'
    : 'Le agradeceremos que proceda al pago en los próximos días.'

  const content = `
    <p>${greeting},</p>

    <p>Le escribimos para recordarle que la factura <strong>${data.invoiceNumber}</strong>
    venció el <strong>${data.dueDate}</strong> y aún no hemos recibido el pago correspondiente.</p>

    <div class="info-box" style="border-left: 4px solid #ef4444;">
      <table>
        <tr>
          <td style="border: none; padding: 5px 0;"><strong>Factura:</strong></td>
          <td style="border: none; padding: 5px 0; text-align: right;">${data.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 5px 0;"><strong>Fecha vencimiento:</strong></td>
          <td style="border: none; padding: 5px 0; text-align: right; color: #ef4444;">${data.dueDate}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 5px 0;"><strong>Días de retraso:</strong></td>
          <td style="border: none; padding: 5px 0; text-align: right; color: #ef4444;">${data.daysOverdue} días</td>
        </tr>
        <tr>
          <td style="border: none; padding: 15px 0 5px 0;"><strong>Importe pendiente:</strong></td>
          <td style="border: none; padding: 15px 0 5px 0; text-align: right;" class="amount">${data.total}</td>
        </tr>
      </table>
    </div>

    <p>${urgencyText}</p>

    <p style="text-align: center;">
      <a href="${data.portalUrl}" class="btn">Ver factura</a>
    </p>

    <div class="divider"></div>

    <p>Si ya ha realizado el pago, por favor ignore este mensaje y disculpe las molestias.</p>

    <p>Para cualquier consulta, no dude en contactarnos.</p>

    <p>Atentamente,<br>
    <strong>El equipo de ${EMAIL_CONFIG.company.name}</strong></p>
  `

  return wrapInLayout(content)
}
