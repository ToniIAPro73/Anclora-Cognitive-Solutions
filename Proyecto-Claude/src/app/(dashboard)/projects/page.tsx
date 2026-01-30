import { Suspense } from 'react'
import Link from 'next/link'
import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { ProjectsTable } from '@/components/projects/projects-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

export default function ProjectsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Proyectos"
        description="Gestiona todos tus proyectos"
        action={
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proyecto
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<ProjectsTableSkeleton />}>
        <ProjectsTable />
      </Suspense>
    </PageContainer>
  )
}

function ProjectsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="rounded-md border">
        <div className="h-12 border-b bg-muted/50" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b p-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    </div>
  )
}
