'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Sparkles, Save, Send, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { saveQuoteAction } from '@/app/actions/quotes'

interface QuoteGeneratorProps {
  projectId: string
  projectName: string
}

export function QuoteGenerator({ projectId, projectName }: QuoteGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error('Por favor, describe los requisitos del presupuesto.')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, prompt }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setGeneratedContent(data)
      toast.success('Presupuesto generado con éxito')
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedContent) return

    setIsSaving(true)
    const result = await saveQuoteAction(
      projectId,
      generatedContent.items,
      {
        subtotal: generatedContent.subtotal,
        iva: generatedContent.iva,
        total: generatedContent.total
      }
    )
    setIsSaving(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Presupuesto guardado como borrador')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-x-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            Generador de Presupuesto con IA
          </CardTitle>
          <CardDescription>
            Proyecto: <span className="font-bold text-slate-900">{projectName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Contexto y Requisitos</Label>
            <Textarea
              id="prompt"
              placeholder="Ej: Necesitamos crear una web de 5 secciones con diseño exclusivo y integración con pasarela de pago Stripe..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analizando y Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar con Llama 3.2
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card className="border-teal-100 bg-teal-50/10">
          <CardHeader>
            <CardTitle className="text-lg">Vista Previa del Presupuesto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-bold">Concepto</th>
                      <th className="text-right p-3 font-bold">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedContent.items.map((item: any, i: number) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right font-mono">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold">
                    <tr>
                      <td className="p-3 text-right">Subtotal:</td>
                      <td className="p-3 text-right">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(generatedContent.subtotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-right">IVA (21%):</td>
                      <td className="p-3 text-right">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(generatedContent.iva)}</td>
                    </tr>
                    <tr className="text-teal-700 text-lg">
                      <td className="p-3 text-right">Total:</td>
                      <td className="p-3 text-right">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(generatedContent.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-x-4">
            <Button variant="outline" className="flex-1" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button className="flex-1 bg-teal-600" disabled={isSaving}>
              <Send className="h-4 w-4 mr-2" />
              Enviar a Cliente
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
