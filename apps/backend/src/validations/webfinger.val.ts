import type { FastifySchema } from "fastify";

export const webFingerQuerySchema = {
  type: "object",
  required: ["resource"],
  properties: {
    resource: { type: "string", minLength: 1, pattern: "^acct:" },
  },
} as const;

export interface WebFingerQuery {
  resource: string;
}

export const webFingerRouteSchema = {
  querystring: webFingerQuerySchema,
} satisfies FastifySchema;
