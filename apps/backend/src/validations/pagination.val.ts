import type { FastifySchema } from "fastify";

const pageProperty = {
  type: "integer",
  minimum: 1,
} as const;

export interface DefaultPageQuery {
  page: number;
}

export interface OptionalPageQuery {
  page?: number;
}

/** Page query for API lists. Missing `page` becomes 1. */
export const defaultPageRouteSchema = {
  querystring: {
    type: "object",
    properties: {
      page: { ...pageProperty, default: 1 },
    },
  },
} satisfies FastifySchema;

/**
 * Page query for ActivityPub collections.
 * A missing `page` means "return the collection object", not page 1.
 */
export const optionalPageRouteSchema = {
  querystring: {
    type: "object",
    properties: {
      page: pageProperty,
    },
  },
} satisfies FastifySchema;
