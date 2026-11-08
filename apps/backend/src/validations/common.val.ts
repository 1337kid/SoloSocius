import type { FastifySchema } from "fastify";

export const nonBlankStringSchema = {
  type: "string",
  minLength: 1,
  pattern: "\\S",
} as const;

export const idParamsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

export interface IdParams {
  id: string;
}

export const idParamsRouteSchema = {
  params: idParamsSchema,
} satisfies FastifySchema;
