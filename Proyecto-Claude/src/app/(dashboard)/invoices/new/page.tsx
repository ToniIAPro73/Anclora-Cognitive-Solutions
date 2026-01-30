import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { InvoiceForm } from '@/components/invoices/invoice-form'
import { getQuotes } from '@/app/actions/quotes'

export default async function NewInvoicePage() {
  const quotesResult = await getQuotes()
  const quotes = quotesResult.success ? quotesResult.data! : []

  // Filter only accepted quotes that don't have an invoice yet
  const availableQuotes = quotes.filter((q) => q.status === 'accepted')

  return (
    <PageContainer>
      <PageHeader
        title="Nueva Factura"
        description="Crea una factura desde un presupuesto aceptado"
        backHref="/dashboard/invoices"
      />

      <div className="max-w-2xl">
        <InvoiceForm quotes={availableQuotes} />
      </div>
    </PageContainer>
  )
}
