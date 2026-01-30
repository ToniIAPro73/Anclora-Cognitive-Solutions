/**
 * Email configuration and constants
 */

export const EMAIL_CONFIG = {
  from: {
    name: 'Anclora Cognitive Solutions',
    email: process.env.EMAIL_FROM || 'noreply@anclora.com',
  },
  replyTo: process.env.EMAIL_REPLY_TO || 'hola@anclora.com',
  company: {
    name: 'Anclora Cognitive Solutions',
    address: 'Calle Ejemplo, 123',
    city: '08001 Barcelona, España',
    phone: '+34 900 123 456',
    website: 'https://anclora.com',
  },
}

export const EMAIL_TEMPLATES = {
  quote: {
    subject: (projectName: string, version: number) =>
      `Presupuesto para ${projectName} (v${version})`,
  },
  invoice: {
    subject: (invoiceNumber: string) =>
      `Factura ${invoiceNumber} - Anclora Cognitive Solutions`,
  },
  reminder: {
    subject: (invoiceNumber: string) =>
      `Recordatorio: Factura ${invoiceNumber} pendiente de pago`,
  },
}
