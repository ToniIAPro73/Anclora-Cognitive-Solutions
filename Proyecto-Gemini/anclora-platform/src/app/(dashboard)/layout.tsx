'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { SidebarProvider, useSidebar } from '@/components/layout/sidebar-provider'
import { cn } from '@/lib/utils'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="h-full relative flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <div 
        className={cn(
          "hidden md:flex flex-col fixed inset-y-0 z-[80] transition-all duration-300 ease-in-out border-r border-border",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <Sidebar />
      </div>
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:pl-20" : "md:pl-72"
        )}
      >
        <Navbar />
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  )
}
