import type { FastifySchema } from "fastify";
import {
  idParamsRouteSchema,
  idParamsSchema,
  nonBlankStringSchema,
} from "./common.val.js";

const mediaItemSchema = {
  type: "object",
  additionalProperties: false,
  required: ["url", "mimeType"],
  properties: {
    url: { type: "string", minLength: 1 },
    mimeType: { type: "string", minLength: 1 },
  },
} as const;

export const createPostBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["content"],
  properties: {
    content: nonBlankStringSchema,
    inReplyTo: { type: "string", minLength: 1 },
    mediaItems: {
      type: "array",
      items: mediaItemSchema,
    },
  },
} as const;

export interface CreatePostBody {
  content: string;
  inReplyTo?: string;
  mediaItems?: { url: string; mimeType: string }[];
}

export interface UpdatePostBody {
  content: string;
}

export const createPostRouteSchema = {
  body: createPostBodySchema,
} satisfies FastifySchema;

export const updatePostRouteSchema = {
  params: idParamsSchema,
  body: {
    type: "object",
    additionalProperties: false,
    required: ["content"],
    properties: {
      content: nonBlankStringSchema,
    },
  },
} satisfies FastifySchema;

export const postIdRouteSchema = idParamsRouteSchema;
