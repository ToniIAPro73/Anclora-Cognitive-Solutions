import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { ProjectForm } from '@/components/projects/project-form'
import { getClientsForSelect } from '@/app/actions/clients'

export default async function NewProjectPage() {
  const clientsResult = await getClientsForSelect()
  const clients = clientsResult.success ? clientsResult.data! : []

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Proyecto"
        description="Crea un nuevo proyecto"
        backHref="/dashboard/projects"
      />

      <div className="max-w-2xl">
        <ProjectForm clients={clients} />
      </div>
    </PageContainer>
  )
}
