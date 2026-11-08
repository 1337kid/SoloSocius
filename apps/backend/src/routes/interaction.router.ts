import { FastifyInstance } from "fastify";

import {
  handleOutboundPostInteraction,
  handleUndoPostInteraction,
} from "../controllers/interaction.controller.js";
import { interactionRouteSchema } from "../validations/social.val.js";

export async function InteractionRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/interact",
    { schema: interactionRouteSchema },
    handleOutboundPostInteraction,
  );
  fastify.delete(
    "/interact",
    { schema: interactionRouteSchema },
    handleUndoPostInteraction,
  );
}
