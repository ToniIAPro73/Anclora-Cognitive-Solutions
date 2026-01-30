import { Suspense } from 'react'
import Link from 'next/link'
import { PageContainer, PageHeader } from '@/components/layout/page-container'
import { InvoicesTable } from '@/components/invoices/invoices-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

export default function InvoicesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Facturas"
        description="Gestiona todas tus facturas"
        action={
          <Button asChild>
            <Link href="/dashboard/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Factura
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<InvoicesTableSkeleton />}>
        <InvoicesTable />
      </Suspense>
    </PageContainer>
  )
}

function InvoicesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="rounded-md border">
        <div className="h-12 border-b bg-muted/50" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b p-4">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    </div>
  )
}
