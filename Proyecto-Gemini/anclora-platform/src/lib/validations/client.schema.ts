import { z } from "zod"

export const clientSchema = z.object({
  company_name: z.string().min(1, "El nombre de la empresa es obligatorio").max(100),
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
  contact_person: z.string().max(100).optional(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Formato E.164 inválido (ej: +34612345678)").optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  nif_cif: z.string().regex(/^[XYZ]?\d{7,8}[A-Z]$/, "NIF/CIF inválido").optional().or(z.literal("")),
  preferred_language: z.enum(["es", "en", "ca"]).default("es"),
  notes: z.string().max(2000).optional(),
})

export type ClientFormValues = z.infer<typeof clientSchema>
