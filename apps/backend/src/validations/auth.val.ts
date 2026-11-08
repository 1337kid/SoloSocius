import type { FastifySchema } from "fastify";

export const credentialsBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["username", "password"],
  properties: {
    username: { type: "string", minLength: 3 },
    password: { type: "string", minLength: 8 },
  },
} as const;

export interface AuthCredentialsBody {
  username: string;
  password: string;
}

export const authCredentialsRouteSchema = {
  body: credentialsBodySchema,
} satisfies FastifySchema;
