import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { QuoteWizard } from '@/components/quotes/quote-wizard'
import { getClientsForSelect } from '@/app/actions/clients'
import { getProjects } from '@/app/actions/projects'

export default async function NewQuotePage() {
  const [clientsResult, projectsResult] = await Promise.all([
    getClientsForSelect(),
    getProjects({ archived: false }),
  ])

  const clients = clientsResult.success ? clientsResult.data! : []
  const projects = projectsResult.success ? projectsResult.data! : []

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Presupuesto"
        description="Genera un presupuesto con asistencia de IA"
        backHref="/dashboard/quotes"
      />

      <QuoteWizard clients={clients} projects={projects} />
    </PageContainer>
  )
}
