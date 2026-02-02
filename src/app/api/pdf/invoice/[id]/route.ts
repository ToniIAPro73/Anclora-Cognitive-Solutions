import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { InvoicePDF } from '@/lib/pdf/invoice-template'
import type { InvoiceWithProject } from '@/types/database.types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('PDF Generation - Starting for invoice:', id)

    const supabase = await createServerSupabaseClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, projects(*, clients(*))')
      .eq('invoice_id', id)
      .single<InvoiceWithProject>()

    if (error) {
      console.error('PDF Generation - Supabase error:', error)
      return NextResponse.json(
        { error: 'Error al obtener factura: ' + error.message },
        { status: 500 }
      )
    }

    if (!invoice) {
      console.log('PDF Generation - Invoice not found')
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    console.log('PDF Generation - Invoice found:', invoice.invoice_number)

    // Generate PDF buffer
    try {
      const pdfBuffer = await renderToBuffer(
        InvoicePDF({ invoice: invoice as InvoiceWithProject })
      )

      console.log('PDF Generation - PDF buffer created, size:', pdfBuffer.byteLength)

      // Return PDF as response
      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="factura-${invoice.invoice_number}.pdf"`,
          'Cache-Control': 'no-store',
        },
      })
    } catch (pdfError) {
      console.error('PDF Generation - renderToBuffer error:', pdfError)
      return NextResponse.json(
        { error: 'Error al renderizar PDF: ' + (pdfError instanceof Error ? pdfError.message : 'Unknown error') },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('PDF Generation - General error:', error)
    return NextResponse.json(
      { error: 'Error al generar PDF: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
