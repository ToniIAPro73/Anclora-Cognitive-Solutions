import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { InvoicePDF } from '@/lib/pdf/invoice-template'
import type { InvoiceWithProject } from '@/types/database.types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, projects(*, clients(*))')
      .eq('invoice_id', params.id)
      .single<InvoiceWithProject>()

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      InvoicePDF({ invoice: invoice as InvoiceWithProject })
    )

    // Return PDF as response
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${invoice.invoice_number}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar PDF' },
      { status: 500 }
    )
  }
}
