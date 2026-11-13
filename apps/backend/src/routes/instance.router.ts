import { FastifyInstance } from "fastify";
import { getInstanceInfo } from "../controllers/instance.controller.js";

export default async function instanceRouter(fastify: FastifyInstance) {
  fastify.get("/instance", getInstanceInfo);
  fastify.get("/v1/instance", getInstanceInfo); // For Mastodon, Misskey compatibility
}
