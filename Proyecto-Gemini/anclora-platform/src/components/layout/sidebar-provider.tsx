'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type SidebarContextType = {
  isCollapsed: boolean
  toggle: () => void
  setIsCollapsed: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  const toggle = () => {
    setIsCollapsed((prev) => {
      const newState = !prev
      localStorage.setItem('sidebar-collapsed', String(newState))
      return newState
    })
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
