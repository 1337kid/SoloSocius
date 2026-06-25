import { FastifyRequest, FastifyReply } from "fastify";

export const validateInteraction = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { action, targetPostUri } = request.body as {
    action: "like" | "boost";
    targetPostUri: string;
  };

  if (!targetPostUri || !["like", "boost"].includes(action)) {
    return reply.status(400).send({
      error: "Valid action (like/boost) and targetPostUri are required.",
    });
  }
};
