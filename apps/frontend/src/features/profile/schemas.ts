import { z } from "zod";

export const ProfileSchema = z.object({
  displayName: z.string().min(1),
  summary: z.string().optional(),
});

export type ProfileSchemaType = z.infer<typeof ProfileSchema>;
