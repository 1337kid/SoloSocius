import { FastifyRequest, FastifyReply } from "fastify";

const TIMELINE_LIMIT = 20;

export const validatePagination = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { page } = request.query as { page?: string };
  const pageNumber = parseInt(page || "1", 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    return reply.status(400).send({ error: "Invalid timeline page." });
  }

  const offsetValue = (pageNumber - 1) * TIMELINE_LIMIT;

  (request as any).pageNumber = pageNumber;
  (request as any).offsetValue = offsetValue;
};
