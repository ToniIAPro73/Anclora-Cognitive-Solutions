import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email is obligatorio"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  fullName: z.string().min(2, "El nombre es demasiado corto"),
  email: z.string().email("Email inválido").min(1, "El email is obligatorio"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export type RegisterFormValues = z.infer<typeof registerSchema>

export const clientRegisterSchema = z.object({
  companyName: z.string().min(2, "El nombre de la empresa es obligatorio"),
  fullName: z.string().min(2, "El nombre de contacto es obligatorio"),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
})

export type ClientRegisterFormValues = z.infer<typeof clientRegisterSchema>

export const magicLinkSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
})

export type MagicLinkFormValues = z.infer<typeof magicLinkSchema>
