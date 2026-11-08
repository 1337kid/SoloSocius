import type { FastifySchema } from "fastify";
import { nonBlankStringSchema } from "./common.val.js";

export const updateProfileBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["displayName"],
  properties: {
    displayName: nonBlankStringSchema,
    summary: { type: "string" },
  },
} as const;

export interface UpdateProfileBody {
  displayName: string;
  summary?: string;
}

export interface DeleteAccountBody {
  password: string;
}

export const updateProfileRouteSchema = {
  body: updateProfileBodySchema,
} satisfies FastifySchema;

export const deleteAccountRouteSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["password"],
    properties: {
      password: { type: "string", minLength: 8 },
    },
  },
} satisfies FastifySchema;
