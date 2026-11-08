import { FastifyInstance } from "fastify";
import {
  handleLogin,
  handleLogout,
  handleSetup,
  handleStatus,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authCredentialsRouteSchema } from "../validations/auth.val.js";

export async function AuthRoutes(fastify: FastifyInstance) {
  fastify.post("/setup", { schema: authCredentialsRouteSchema }, handleSetup);
  fastify.post("/login", { schema: authCredentialsRouteSchema }, handleLogin);
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
