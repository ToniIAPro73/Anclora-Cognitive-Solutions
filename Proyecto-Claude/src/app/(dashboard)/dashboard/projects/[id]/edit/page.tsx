import { notFound } from 'next/navigation'
import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { ProjectForm } from '@/components/projects/project-form'
import { getProject } from '@/app/actions/projects'
import { getClientsForSelect } from '@/app/actions/clients'

interface EditProjectPageProps {
  params: { id: string }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const [projectResult, clientsResult] = await Promise.all([
    getProject(params.id),
    getClientsForSelect(),
  ])

  if (!projectResult.success || !projectResult.data) {
    notFound()
  }

  const clients = clientsResult.success ? clientsResult.data! : []

  return (
    <PageContainer>
      <PageHeader
        title="Editar Proyecto"
        description={projectResult.data.project_name}
        backHref="/dashboard/projects"
      />

      <div className="max-w-2xl">
        <ProjectForm
          project={projectResult.data}
          clients={clients}
          isEditing
        />
      </div>
    </PageContainer>
  )
}
