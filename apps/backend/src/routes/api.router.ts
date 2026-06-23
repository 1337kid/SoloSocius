import { FastifyInstance } from "fastify";
import { handleFollowRemoteUser } from "../controllers/following.controller.js";
import {
  createPost,
  deletePost,
  getHomeTimeline,
  updatePost,
} from "../controllers/posts.controller.js";
import { handleOutboundPostInteraction } from "../controllers/interaction.controller.js";

export async function APIRoutes(fastify: FastifyInstance) {
  fastify.post("/follow", handleFollowRemoteUser);

  // user post routes
  fastify.post("/posts", createPost);
  fastify.put("/posts/:id", updatePost);
  fastify.delete("/posts/:id", deletePost);

  // social
  fastify.get("/timeline", getHomeTimeline);
  fastify.post("/interact", handleOutboundPostInteraction);
}
