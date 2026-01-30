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
import { Plus, Search, Edit2, Trash2, Eye, Users } from 'lucide-react'
import { ClientFormModal } from '@/components/clients/client-form-modal'
import { deleteClientAction } from '@/app/actions/clients'
import { toast } from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gestión centralizada de tu base de clientes y su actividad.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          onClick={() => {
            setEditingClient(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <Card className="border-none shadow-none bg-muted/30 p-2 rounded-2xl">
        <CardContent className="p-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre o email..." 
              className="pl-11 bg-background border-border/50 h-12 rounded-xl focus-visible:ring-primary shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="py-5 px-6 font-bold text-foreground">Empresa</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground">Contacto</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground text-center">Idioma</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground text-center">Proyectos</TableHead>
              <TableHead className="py-5 px-6 font-bold text-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-10 w-10 opacity-20" />
                    <p>No se encontraron clientes.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.client_id} className="hover:bg-muted/30 border-border/40 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-4 text-primary font-bold shadow-inner">
                        {client.company_name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-foreground">{client.company_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{client.contact_person || '-'}</span>
                      <span className="text-xs text-muted-foreground">{client.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    <Badge variant="outline" className="uppercase font-bold text-[10px] tracking-widest border-border/50 bg-background">
                      {client.preferred_language}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    <Badge variant="secondary" className="font-semibold bg-primary/5 text-primary border-primary/10">
                      {client.projects?.[0]?.count || 0} Proyectos
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-x-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-background shadow-sm" title="Ver detalles">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 shadow-sm"
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
                        className="h-9 w-9 rounded-lg hover:bg-destructive/5 shadow-sm"
                        title="Eliminar"
                        onClick={() => handleDelete(client.client_id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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
