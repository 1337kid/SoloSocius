import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password is required"),
});

export const SetupSchema = LoginSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  error: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;
export type SetupSchemaType = z.infer<typeof SetupSchema>;
