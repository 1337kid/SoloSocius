import { FastifyInstance } from "fastify";
import {
  handleLogin,
  handleLogout,
  handleSetup,
  handleStatus,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function AuthRoutes(fastify: FastifyInstance) {
  fastify.post("/setup", handleSetup);
  fastify.post("/login", handleLogin);
  fastify.post("/logout", handleLogout);
  fastify.get("/status", handleStatus);

  fastify.get(
    "/me",
    {
      preHandler: [authenticate],
    },
    async (request) => {
      return request.user;
    },
  );
}
