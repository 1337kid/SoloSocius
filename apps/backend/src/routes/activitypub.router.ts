import { FastifyInstance } from "fastify";
import {
  getActorProfile,
  getSystemActorProfile,
} from "../controllers/actor.controller.js";
import { verifyIncomingSignature } from "../middlewares/verifySignature.js";
import { handleIncomingInbox } from "../controllers/inbox/inbox.controller.js";
import {
  handleSystemOutboxRequest,
  handleUserOutboxRequest,
} from "../controllers/outbox.controller.js";
import { getPostActivity } from "../controllers/posts.controller.js";
import { handleWebFinger } from "../controllers/webfinger.controller.js";
import { handleFollowingCollectionRequest } from "../controllers/following.controller.js";
import { handleFollowersCollectionRequest } from "../controllers/followers.controller.js";
import { getMedia } from "../controllers/media.controller.js";
import {
  nodeinfoRoutes,
  getNodeInfo,
} from "../controllers/nodeinfo.controller.js";
import { mediaKeyRouteSchema } from "../validations/media.val.js";
import { optionalPageRouteSchema } from "../validations/pagination.val.js";
import { postIdRouteSchema } from "../validations/posts.val.js";
import { webFingerRouteSchema } from "../validations/webfinger.val.js";

export async function activityPubRoutes(fastify: FastifyInstance) {
  fastify.get("/media/*", { schema: mediaKeyRouteSchema }, getMedia);
  fastify.get(
    "/.well-known/webfinger",
    { schema: webFingerRouteSchema },
    handleWebFinger,
  );
  fastify.get("/actor", getActorProfile);

  fastify.post(
    "/inbox",
    { preHandler: [verifyIncomingSignature] },
    handleIncomingInbox,
  );

  fastify.get(
    "/outbox",
    { schema: optionalPageRouteSchema },
    handleUserOutboxRequest,
  );
  fastify.get("/posts/:id", { schema: postIdRouteSchema }, getPostActivity);
  fastify.get(
    "/following",
    { schema: optionalPageRouteSchema },
    handleFollowingCollectionRequest,
  );
  fastify.get(
    "/followers",
    { schema: optionalPageRouteSchema },
    handleFollowersCollectionRequest,
  );

  // NodeInfo routes
  fastify.get("/nodeinfo/2.0", getNodeInfo);
  fastify.get("/.well-known/nodeinfo", nodeinfoRoutes);

  // System actor routes
  fastify.get("/actor/system", getSystemActorProfile);
  fastify.get(
    "/actor/system/outbox",
    { schema: optionalPageRouteSchema },
    handleSystemOutboxRequest,
  );
}
