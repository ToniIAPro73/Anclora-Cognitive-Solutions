'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveQuoteAction(projectId: string, content: any, totals: { subtotal: number, iva: number, total: number }) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quotes')
    .insert([
      {
        project_id: projectId,
        content_json: content,
        subtotal: totals.subtotal,
        iva: totals.iva,
        total: totals.total,
        status: 'draft',
      },
    ])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/quotes')
  return { success: true, quote: data }
}

export async function sendQuoteAction(quoteId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('quotes')
    .update({ 
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .eq('quote_id', quoteId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/quotes')
  return { success: true }
}
