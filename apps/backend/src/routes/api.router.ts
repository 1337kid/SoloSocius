import { FastifyInstance } from "fastify";
import { handleFollowRemoteUser } from "../controllers/following.controller.js";
import {
  createPost,
  deletePost,
  updatePost,
} from "../controllers/posts.controller.js";
import {
  handleOutboundPostInteraction,
  handleUndoPostInteraction,
} from "../controllers/interaction.controller.js";
import {
  getHomeFeed,
  getPublicTimeline,
} from "../controllers/timeline.controller.js";
import { validatePagination } from "../middlewares/validatePagination.js";
import { validateInteraction } from "../middlewares/validateInteraction.js";

export async function APIRoutes(fastify: FastifyInstance) {
  fastify.post("/follow", handleFollowRemoteUser);

  // user post routes
  fastify.post("/posts", createPost);
  fastify.put("/posts/:id", updatePost);
  fastify.delete("/posts/:id", deletePost);

  // social
  fastify.get("/feed", { preHandler: [validatePagination] }, getHomeFeed);

  fastify.get(
    "/timeline",
    { preHandler: [validatePagination] },
    getPublicTimeline,
  );

  fastify.post(
    "/interact",
    { preHandler: [validateInteraction] },
    handleOutboundPostInteraction,
  );
  fastify.delete(
    "/interact",
    { preHandler: [validateInteraction] },
    handleUndoPostInteraction,
  );
}
