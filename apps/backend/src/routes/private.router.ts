import { FastifyInstance } from "fastify";
import {
  handleFollowRemoteUser,
  handleUnfollowRemoteUser,
} from "../controllers/following.controller.js";
import {
  createPost,
  deletePost,
  updatePost,
} from "../controllers/posts.controller.js";
import {
  handleOutboundPostInteraction,
  handleUndoPostInteraction,
} from "../controllers/interaction.controller.js";
import { getHomeFeed } from "../controllers/timeline.controller.js";
import { validatePagination } from "../middlewares/validatePagination.js";
import { validateInteraction } from "../middlewares/validateInteraction.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function PrivateRoutes(fastify: FastifyInstance) {
  //fastify.addHook("preHandler", authenticate);

  fastify.post("/follow", handleFollowRemoteUser);
  fastify.delete("/follow", handleUnfollowRemoteUser);
  // user post routes
  fastify.post("/posts", createPost);
  fastify.put("/posts/:id", updatePost);
  fastify.delete("/posts/:id", deletePost);

  // social
  fastify.get("/feed", { preHandler: [validatePagination] }, getHomeFeed);

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
