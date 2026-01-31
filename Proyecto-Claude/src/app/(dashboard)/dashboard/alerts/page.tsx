import { Suspense } from 'react'
import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { AlertsList } from '@/components/alerts/alerts-list'
import { Skeleton } from '@/components/ui/skeleton'

export default function AlertsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Alertas"
        description="Notificaciones y alertas del sistema"
      />

      <Suspense fallback={<AlertsSkeleton />}>
        <AlertsList />
      </Suspense>
    </PageContainer>
  )
}

function AlertsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[300px]" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}
