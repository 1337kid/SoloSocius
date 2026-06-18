import { FastifyInstance } from "fastify";
import { getActorProfile } from "../controllers/actor.controller.js";
import { handleWebFinger } from "../controllers/webfinger.controller.js";
import { verifyIncomingSignature } from "../middlewares/verifySignature.js";
import { handleIncomingInbox } from "../controllers/inbox.controller.js";
import { handleOutboxRequest } from "../controllers/outbox.controller.js";

export async function activityPubRoutes(fastify: FastifyInstance) {
  fastify.get("/", getActorProfile);
  fastify.post(
    "/inbox",
    { preHandler: [verifyIncomingSignature] },
    handleIncomingInbox,
  );
  fastify.get("/outbox", handleOutboxRequest);
}
