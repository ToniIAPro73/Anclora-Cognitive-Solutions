import { Suspense } from 'react'
import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { Skeleton } from '@/components/ui/skeleton'

export default function KanbanPage() {
  return (
    <PageContainer className="p-0">
      <div className="p-6 pb-0">
        <PageHeader
          title="Kanban"
          description="Gestiona el flujo de tus proyectos"
        />
      </div>

      <Suspense fallback={<KanbanSkeleton />}>
        <KanbanBoard />
      </Suspense>
    </PageContainer>
  )
}

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto p-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="min-w-[300px] flex-shrink-0">
          <Skeleton className="mb-4 h-8 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
