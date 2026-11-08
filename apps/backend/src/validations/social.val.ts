import type { FastifySchema } from "fastify";
import { idParamsRouteSchema } from "./common.val.js";

export const interactionBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["action", "targetPostUri"],
  properties: {
    action: { type: "string", enum: ["like", "boost"] },
    targetPostUri: { type: "string", minLength: 1 },
  },
} as const;

export interface InteractionBody {
  action: "like" | "boost";
  targetPostUri: string;
}

export interface ActorUriBody {
  actorUri: string;
}

export interface SearchUserBody {
  handle: string;
}

export const interactionRouteSchema = {
  body: interactionBodySchema,
} satisfies FastifySchema;

export const actorUriRouteSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["actorUri"],
    properties: {
      actorUri: { type: "string", minLength: 1 },
    },
  },
} satisfies FastifySchema;

export const searchUserRouteSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["handle"],
    properties: {
      handle: { type: "string", minLength: 1, pattern: "@" },
    },
  },
} satisfies FastifySchema;

export const followRequestIdRouteSchema = idParamsRouteSchema;
