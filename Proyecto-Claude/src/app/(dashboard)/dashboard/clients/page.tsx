import { Suspense } from 'react'
import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ClientTable } from '@/components/clients/client-table'
import { ClientFormModal } from '@/components/clients/client-form-modal'
import { Skeleton } from '@/components/ui/skeleton'

export default function ClientsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Clientes"
        description="Gestiona tu cartera de clientes"
        actions={<ClientFormModal />}
      />

      <Suspense fallback={<ClientTableSkeleton />}>
        <ClientTable />
      </Suspense>
    </PageContainer>
  )
}

function ClientTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-lg border">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-4 border-b last:border-0">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
