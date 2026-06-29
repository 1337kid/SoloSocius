import { FastifyInstance } from "fastify";
import { getActorProfile } from "../controllers/actor.controller.js";
import { verifyIncomingSignature } from "../middlewares/verifySignature.js";
import { handleIncomingInbox } from "../controllers/inbox/inbox.controller.js";
import { handleOutboxRequest } from "../controllers/outbox.controller.js";
import { getPostActivity } from "../controllers/posts.controller.js";
import { handleWebFinger } from "../controllers/webfinger.controller.js";
import { handleFollowingCollectionRequest } from "../controllers/following.controller.js";
import { handleFollowersCollectionRequest } from "../controllers/followers.controller.js";

export async function activityPubRoutes(fastify: FastifyInstance) {
  fastify.get("/.well-known/webfinger", handleWebFinger);
  fastify.get("/actor", getActorProfile);

  fastify.post(
    "/inbox",
    { preHandler: [verifyIncomingSignature] },
    handleIncomingInbox,
  );

  fastify.get("/outbox", handleOutboxRequest);
  fastify.get("/posts/:id", getPostActivity);
  fastify.get("/following", handleFollowingCollectionRequest);
  fastify.get("/followers", handleFollowersCollectionRequest);
}
