import { z } from 'zod'

export const SendMagicLinkSchema = z.object({
  email: z.email(),
})

export type SendMagicLinkInput = z.infer<typeof SendMagicLinkSchema>