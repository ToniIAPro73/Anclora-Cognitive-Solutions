'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema, type LoginFormValues, registerSchema, type RegisterFormValues, magicLinkSchema, type MagicLinkFormValues, clientRegisterSchema, type ClientRegisterFormValues } from '@/lib/validations/auth.schema'
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

  redirect('/dashboard')
}

export async function signUp(values: RegisterFormValues) {
  const validatedFields = registerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Campos inválidos' }
  }

  const { email, password, fullName } = validatedFields.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'admin', // Assigning admin role for MVP registration
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

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

export async function signUpClient(values: ClientRegisterFormValues) {
  const validatedFields = clientRegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Campos inválidos' }
  }

  const { email, companyName, fullName } = validatedFields.data
  const supabase = await createClient()

  // 1. Create client record first
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert([{
      company_name: companyName,
      email: email,
      contact_person: fullName,
    }])
    .select()
    .single()

  if (clientError) {
    return { error: 'No se pudo crear el registro del cliente: ' + clientError.message }
  }

  // 2. Send magic link to the new client
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/portal/client/${client.client_id}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: '¡Registro completado! Revisa tu email para el enlace de acceso.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
