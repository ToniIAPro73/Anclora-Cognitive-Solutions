'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema, type LoginFormValues, magicLinkSchema, type MagicLinkFormValues } from '@/lib/validations/auth.schema'
import { redirect } from 'next/navigation'

export async function signIn(values: LoginFormValues) {
  const validatedFields = loginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Campos inválidos' }
  }

  const { email, password } = validatedFields.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if admin (this would normally be handled by a query to a profiles table or looking at JWT meta)
  // For MVP, we'll let the user in and let middleware handle protection based on what Supabase returns.
  
  redirect('/dashboard')
}

export async function signInWithMagicLink(values: MagicLinkFormValues) {
  const validatedFields = magicLinkSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Email inválido' }
  }

  const { email } = validatedFields.data
  const supabase = await createClient()

  // Verify email exists in clients table before sending magic link
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('client_id')
    .eq('email', email)
    .single()

  if (clientError || !client) {
    return { error: 'Este email no está registrado como cliente.' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/portal/client/${client.client_id}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Se ha enviado un enlace de acceso a tu email.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
