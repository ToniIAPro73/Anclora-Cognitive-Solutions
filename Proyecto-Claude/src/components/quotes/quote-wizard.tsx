'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { generateQuoteWithAI, createQuote } from '@/app/actions/quotes'
import type { Project, QuoteContent } from '@/types/database.types'
import { Loader2, ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface QuoteWizardProps {
  clients: { client_id: string; company_name: string }[]
  projects: Project[]
}

const PREDEFINED_SERVICES = [
  { id: 'consulting', name: 'Consultoría IA', baseHours: 20 },
  { id: 'development', name: 'Desarrollo Custom', baseHours: 80 },
  { id: 'integration', name: 'Integración APIs', baseHours: 40 },
  { id: 'training', name: 'Formación', baseHours: 16 },
  { id: 'maintenance', name: 'Mantenimiento', baseHours: 10 },
  { id: 'audit', name: 'Auditoría Técnica', baseHours: 24 },
]

const TONES = [
  { value: 'professional', label: 'Profesional' },
  { value: 'friendly', label: 'Amigable' },
  { value: 'technical', label: 'Técnico' },
  { value: 'executive', label: 'Ejecutivo' },
]

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'ca', label: 'Catalán' },
]

type WizardStep = 1 | 2 | 3

interface WizardData {
  project_id: string
  client_name: string
  project_name: string
  project_description: string
  services: {
    id: string
    name: string
    selected: boolean
    hours: number
    description_detail: string
  }[]
  language: 'es' | 'en' | 'ca'
  tone: string
  technical_depth: number
  custom_instructions: string
}

export function QuoteWizard({ clients, projects }: QuoteWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>(1)
  const [generatedContent, setGeneratedContent] = useState<QuoteContent | null>(null)

  const [data, setData] = useState<WizardData>({
    project_id: '',
    client_name: '',
    project_name: '',
    project_description: '',
    services: PREDEFINED_SERVICES.map((s) => ({
      id: s.id,
      name: s.name,
      selected: false,
      hours: s.baseHours,
      description_detail: '',
    })),
    language: 'es',
    tone: 'professional',
    technical_depth: 5,
    custom_instructions: '',
  })

  const selectedProject = projects.find((p) => p.project_id === data.project_id)
  const client = selectedProject
    ? clients.find((c) => c.client_id === selectedProject.client_id)
    : null

  const generateMutation = useMutation({
    mutationFn: async () => {
      const selectedServices = data.services
        .filter((s) => s.selected)
        .map((s) => ({
          name: s.name,
          custom_hours: s.hours,
          description_detail: s.description_detail || undefined,
        }))

      const result = await generateQuoteWithAI({
        project_id: data.project_id,
        client_name: data.client_name || client?.company_name || '',
        project_name: data.project_name || selectedProject?.project_name || '',
        project_description: data.project_description || selectedProject?.description || '',
        services: selectedServices,
        language: data.language,
        tone: data.tone,
        technical_depth: data.technical_depth,
        custom_instructions: data.custom_instructions,
      })

      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    onSuccess: (content) => {
      setGeneratedContent(content)
      setStep(3)
      toast.success('Presupuesto generado con IA')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!generatedContent) throw new Error('No hay contenido generado')

      const result = await createQuote({
        project_id: data.project_id,
        language: data.language,
        tone: data.tone,
        content_json: generatedContent,
        subtotal: generatedContent.subtotal,
        iva: generatedContent.iva,
        total: generatedContent.total,
      })

      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    onSuccess: (quote) => {
      toast.success('Presupuesto guardado')
      router.push(`/dashboard/quotes/${quote.quote_id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p.project_id === projectId)
    const projectClient = project
      ? clients.find((c) => c.client_id === project.client_id)
      : null

    setData({
      ...data,
      project_id: projectId,
      project_name: project?.project_name || '',
      project_description: project?.description || '',
      client_name: projectClient?.company_name || '',
    })
  }

  const handleServiceToggle = (serviceId: string) => {
    setData({
      ...data,
      services: data.services.map((s) =>
        s.id === serviceId ? { ...s, selected: !s.selected } : s
      ),
    })
  }

  const handleServiceHoursChange = (serviceId: string, hours: number) => {
    setData({
      ...data,
      services: data.services.map((s) =>
        s.id === serviceId ? { ...s, hours } : s
      ),
    })
  }

  const canProceedStep1 = data.project_id && data.services.some((s) => s.selected)
  const canProceedStep2 = data.language && data.tone

  const isLoading = generateMutation.isPending || saveMutation.isPending

  return (
    <div className="max-w-3xl">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium ${
                step >= s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground text-muted-foreground'
              }`}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`h-1 w-20 mx-2 ${
                  step > s ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Project & Services */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 1: Proyecto y Servicios</CardTitle>
            <CardDescription>
              Selecciona el proyecto y los servicios a incluir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Proyecto *</Label>
              <Select value={data.project_id} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.project_id} value={project.project_id}>
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {data.project_id && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del proyecto</Label>
                    <Input
                      value={data.project_name}
                      onChange={(e) =>
                        setData({ ...data, project_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cliente</Label>
                    <Input
                      value={data.client_name}
                      onChange={(e) =>
                        setData({ ...data, client_name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descripción del proyecto</Label>
                  <Textarea
                    value={data.project_description}
                    onChange={(e) =>
                      setData({ ...data, project_description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="space-y-4">
              <Label>Servicios a incluir *</Label>
              <div className="space-y-3">
                {data.services.map((service) => (
                  <div
                    key={service.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      service.selected ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={service.id}
                          checked={service.selected}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <label
                          htmlFor={service.id}
                          className="font-medium cursor-pointer"
                        >
                          {service.name}
                        </label>
                      </div>
                      {service.selected && (
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Horas:</Label>
                          <Input
                            type="number"
                            value={service.hours}
                            onChange={(e) =>
                              handleServiceHoursChange(
                                service.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20"
                            min={1}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
            >
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: AI Configuration */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 2: Configuración IA</CardTitle>
            <CardDescription>
              Personaliza cómo la IA generará el presupuesto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Idioma *</Label>
                <Select
                  value={data.language}
                  onValueChange={(value: 'es' | 'en' | 'ca') =>
                    setData({ ...data, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tono *</Label>
                <Select
                  value={data.tone}
                  onValueChange={(value) => setData({ ...data, tone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value}>
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Profundidad técnica</Label>
                <span className="text-sm text-muted-foreground">
                  {data.technical_depth}/10
                </span>
              </div>
              <Slider
                value={[data.technical_depth]}
                onValueChange={([value]) =>
                  setData({ ...data, technical_depth: value })
                }
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Básico</span>
                <span>Muy técnico</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instrucciones personalizadas</Label>
              <Textarea
                value={data.custom_instructions}
                onChange={(e) =>
                  setData({ ...data, custom_instructions: e.target.value })
                }
                placeholder="Ej: Incluir garantía de 6 meses, mencionar tecnologías específicas..."
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={!canProceedStep2 || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generar con IA
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Review & Save */}
      {step === 3 && generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 3: Revisar y Guardar</CardTitle>
            <CardDescription>
              Revisa el presupuesto generado antes de guardarlo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Introducción</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {generatedContent.introduction}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Servicios</h4>
                <div className="space-y-3">
                  {generatedContent.services.map((service, index) => (
                    <div key={index} className="rounded border p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{service.name}</span>
                        <span className="text-sm">
                          {service.hours}h × {service.hourly_rate}€ ={' '}
                          <strong>{service.total}€</strong>
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{generatedContent.subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (21%)</span>
                  <span>{generatedContent.iva.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-medium text-lg mt-2">
                  <span>Total</span>
                  <span>{generatedContent.total.toFixed(2)}€</span>
                </div>
              </div>

              {generatedContent.payment_terms && (
                <div>
                  <h4 className="font-medium mb-2">Términos de pago</h4>
                  <p className="text-sm text-muted-foreground">
                    {generatedContent.payment_terms}
                  </p>
                </div>
              )}

              {generatedContent.validity && (
                <div>
                  <h4 className="font-medium mb-2">Validez</h4>
                  <p className="text-sm text-muted-foreground">
                    {generatedContent.validity}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Regenerar
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar presupuesto
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
