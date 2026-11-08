import type { FastifyError, FastifyInstance } from "fastify";

/**
 * Keep validation failures on the API's `{ error: string }` shape.
 * Other errors keep Fastify's default serializer.
 */
export function registerValidationErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error.validation) {
      return reply.status(400).send({ error: error.message });
    }

    return reply.send(error);
  });
}
