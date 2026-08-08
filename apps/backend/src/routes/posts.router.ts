import { FastifyInstance } from "fastify";

import {
  createPost,
  updatePost,
  deletePost,
  getPostWithReplies,
} from "../controllers/posts.controller.js";
import { validatePagination } from "../middlewares/validatePagination.js";
import { getHomeFeed } from "../controllers/timeline.controller.js";

export async function PostsRoutes(fastify: FastifyInstance) {
  fastify.post("/posts", createPost);
  fastify.put("/posts/:id", updatePost);
  fastify.delete("/posts/:id", deletePost);
  fastify.get("/posts/:id", getPostWithReplies);

  // social
  fastify.get("/feed", { preHandler: [validatePagination] }, getHomeFeed);
}
