import type { FastifySchema } from "fastify";
import { idParamsRouteSchema, nonBlankStringSchema } from "./common.val.js";

export const createRelayBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "inboxUrl"],
  properties: {
    name: nonBlankStringSchema,
    inboxUrl: { type: "string", format: "uri", pattern: "^https?://" },
  },
} as const;

export interface CreateRelayBody {
  name: string;
  inboxUrl: string;
}

export const createRelayRouteSchema = {
  body: createRelayBodySchema,
} satisfies FastifySchema;

export const relayIdRouteSchema = idParamsRouteSchema;
