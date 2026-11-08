import type { FastifySchema } from "fastify";

/**
 * Object key from `/media/*`. Rejects empty keys, absolute paths, and `..`.
 */
export const mediaKeyParamsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["*"],
  properties: {
    "*": {
      type: "string",
      minLength: 1,
      pattern: "^(?!/)(?!\\\\)(?!.*\\.\\.).+$",
    },
  },
} as const;

export interface MediaKeyParams {
  "*": string;
}

export interface DeleteAttachmentBody {
  key: string;
}

export const mediaKeyRouteSchema = {
  params: mediaKeyParamsSchema,
} satisfies FastifySchema;

export const deleteAttachmentRouteSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["key"],
    properties: {
      key: {
        type: "string",
        minLength: 1,
        pattern: "^posts/.+",
      },
    },
  },
} satisfies FastifySchema;
