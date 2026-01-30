'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
import { ClientFormModal } from '@/components/clients/client-form-modal'
import { deleteClientAction } from '@/app/actions/clients'
import { toast } from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*, projects(count)')
      .order('company_name', { ascending: true })

    if (error) {
      toast.error('Error al cargar clientes')
    } else {
      setClients(data || [])
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      const result = await deleteClientAction(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cliente eliminado')
        fetchClients()
      }
    }
  }

  const filteredClients = clients.filter(client => 
    client.company_name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestiona la base de datos de tus clientes y sus proyectos.</p>
        </div>
        <Button 
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => {
            setEditingClient(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-x-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o email..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead>Proyectos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.client_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-xs font-bold uppercase">
                        {client.company_name.substring(0, 2)}
                      </div>
                      {client.company_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{client.contact_person || '-'}</span>
                      <span className="text-xs text-muted-foreground">{client.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {client.preferred_language}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {client.projects?.[0]?.count || 0} Proyectos
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-x-2">
                      <Button variant="ghost" size="icon" title="Ver detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Editar"
                        onClick={() => {
                          setEditingClient(client)
                          setIsModalOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4 text-sky-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Eliminar"
                        onClick={() => handleDelete(client.client_id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ClientFormModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          fetchClients()
        }}
        initialData={editingClient}
      />
    </div>
  )
}
