'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <div className="flex items-center p-4">
      <div className="flex w-full justify-end items-center gap-x-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-8 bg-slate-50 border-none" />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </Button>
        <div className="flex items-center gap-x-2">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs uppercase">
            AD
          </div>
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>
    </div>
  )
}
