import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { QuotePDF } from '@/lib/pdf/quote-template'
import type { QuoteWithProject } from '@/types/database.types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*, projects(*, clients(*))')
      .eq('quote_id', params.id)
      .single()

    if (error || !quote) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      )
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      QuotePDF({ quote: quote as QuoteWithProject })
    )

    // Get project name for filename
    const projectName = quote.projects?.project_name?.replace(/[^a-zA-Z0-9]/g, '-') || 'presupuesto'

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${projectName}-v${quote.version}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error generating quote PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar PDF' },
      { status: 500 }
    )
  }
}
