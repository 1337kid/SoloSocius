import { FastifyInstance } from "fastify";
import { InteractionRoutes } from "./interaction.router.js";
import { PostsRoutes } from "./posts.router.js";
import { UserRoutes } from "./user.router.js";
import { PrivateMediaRoutes } from "./media.router.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function PrivateRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);
  fastify.register(InteractionRoutes);
  fastify.register(PostsRoutes);
  fastify.register(UserRoutes);
  fastify.register(PrivateMediaRoutes);
}
