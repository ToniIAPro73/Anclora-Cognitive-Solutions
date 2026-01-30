import { notFound } from 'next/navigation'
import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { QuoteDetail } from '@/components/quotes/quote-detail'
import { getQuoteById } from '@/app/actions/quotes'

interface QuoteDetailPageProps {
  params: { id: string }
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const result = await getQuoteById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Presupuesto v${result.data.version}`}
        description={result.data.projects?.project_name || 'Sin proyecto'}
        backHref="/dashboard/quotes"
      />

      <QuoteDetail quote={result.data} />
    </PageContainer>
  )
}
