import { z } from "zod"

export const CreateRelaySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  inboxUrl: z
    .string()
    .trim()
    .min(1, "Inbox URL is required")
    .regex(/^https?:\/\/\S+$/i, "Enter an http or https inbox URL"),
})

export type CreateRelaySchemaType = z.infer<typeof CreateRelaySchema>
