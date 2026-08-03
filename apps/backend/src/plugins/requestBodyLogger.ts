import fp from "fastify-plugin";
import { NODE_ENV } from "../config/env.js";

export default fp(async (fastify) => {
  if (NODE_ENV === "production") return;

  fastify.addHook("preHandler", async (request) => {
    request.log.info({ body: request.body }, "Request body");
  });
});
