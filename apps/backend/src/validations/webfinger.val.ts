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

export const fetchExternalUserDetailsQuerySchema = {
  type: "object",
  required: ["webfinger"],
  properties: {
    webfinger: {
      type: "string",
      minLength: 5,
      pattern: "^@[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
    },
  },
} as const;

export interface FetchExternalUserDetailsQuery {
  webfinger: string;
}

export const fetchExternalUserDetailsRouteSchema = {
  querystring: fetchExternalUserDetailsQuerySchema,
} satisfies FastifySchema;
