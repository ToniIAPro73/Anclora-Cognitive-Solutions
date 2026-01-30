import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const magicLinkSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
})

export type MagicLinkFormValues = z.infer<typeof magicLinkSchema>
