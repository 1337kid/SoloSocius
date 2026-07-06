import { FastifyInstance } from "fastify";

import {
  handleOutboundPostInteraction,
  handleUndoPostInteraction,
} from "../controllers/interaction.controller.js";
import { validateInteraction } from "../middlewares/validateInteraction.js";

export async function InteractionRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", validateInteraction);

  fastify.post("/interact", handleOutboundPostInteraction);
  fastify.delete("/interact", handleUndoPostInteraction);
}
