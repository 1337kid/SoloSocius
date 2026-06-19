import { FastifyInstance } from "fastify";
import { handleFollowRemoteUser } from "../controllers/following.controller.js";
import {
  createPost,
  deletePost,
  updatePost,
} from "../controllers/posts.controller.js";

export async function APIRoutes(fastify: FastifyInstance) {
  fastify.post("/follow", handleFollowRemoteUser);

  // user post routes
  fastify.post("/posts", createPost);
  fastify.put("/posts/:id", updatePost);
  fastify.delete("/posts/:id", deletePost);
}
