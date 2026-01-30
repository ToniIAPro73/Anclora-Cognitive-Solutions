'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Pencil, Trash2, Search, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getClients, deleteClient } from '@/app/actions/clients'
import { getInitials, formatRelativeTime, LANGUAGE_LABELS } from '@/lib/utils'
import { ClientFormModal } from './client-form-modal'
import { EmptyState } from '@/components/layout/empty-state'
import type { Client } from '@/types/database.types'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

export function ClientTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [language, setLanguage] = useState(searchParams.get('language') || 'all')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [editClient, setEditClient] = useState<Client | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search, language, page],
    queryFn: async () => {
      const result = await getClients({
        search: search || undefined,
        language: language as 'all' | 'es' | 'en' | 'ca' | undefined,
        page,
        limit: 20,
      })
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const result = await deleteClient(clientId)
      if (!result.success) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente eliminado')
      setDeleteDialogOpen(false)
      setClientToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }, 300)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    debouncedSearch(value)
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value !== 'all') {
      params.set('language', value)
    } else {
      params.delete('language')
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete.client_id)
    }
  }

  const clients = data?.clients || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20)

  if (!isLoading && clients.length === 0 && !search && language === 'all') {
    return (
      <EmptyState
        icon={Users}
        title="No hay clientes"
        description="Crea tu primer cliente para empezar a gestionar proyectos"
        action={{
          label: 'Crear cliente',
          onClick: () => setEditClient({} as Client),
        }}
      />
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los idiomas</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ca">Català</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.client_id}>
                <TableCell>
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(client.company_name)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{client.company_name}</p>
                    {client.contact_person && (
                      <p className="text-sm text-muted-foreground">
                        {client.contact_person}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {LANGUAGE_LABELS[client.preferred_language]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeTime(client.updated_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditClient(client)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setClientToDelete(client)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a{' '}
              <strong>{clientToDelete?.company_name}</strong> y todos sus datos
              asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editClient && (
        <ClientFormModal
          client={editClient.client_id ? editClient : undefined}
          open={!!editClient}
          onOpenChange={(open) => !open && setEditClient(null)}
        />
      )}
    </>
  )
}
