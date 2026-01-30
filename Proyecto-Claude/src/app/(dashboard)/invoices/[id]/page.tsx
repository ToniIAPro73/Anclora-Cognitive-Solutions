import { notFound } from 'next/navigation'
import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { InvoiceDetail } from '@/components/invoices/invoice-detail'
import { getInvoiceById } from '@/app/actions/invoices'

interface InvoiceDetailPageProps {
  params: { id: string }
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const result = await getInvoiceById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Factura ${result.data.invoice_number}`}
        description={result.data.quotes?.projects?.project_name || 'Sin proyecto'}
        backHref="/dashboard/invoices"
      />

      <InvoiceDetail invoice={result.data} />
    </PageContainer>
  )
}
