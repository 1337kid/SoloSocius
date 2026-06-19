import { FastifyInstance } from "fastify";
import { handleFollowRemoteUser } from "../controllers/following.controller.js";
import { createPost } from "../controllers/posts.controller.js";

export async function APIRoutes(fastify: FastifyInstance) {
  fastify.post("/follow", handleFollowRemoteUser);
  fastify.post("/posts", createPost);
}
