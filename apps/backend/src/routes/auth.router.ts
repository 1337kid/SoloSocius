import { FastifyInstance } from "fastify";
import {
  handleLogin,
  handleLogout,
  handleSetup,
} from "../controllers/auth.controller.js";

export async function AuthRoutes(fastify: FastifyInstance) {
  fastify.post("/setup", handleSetup);
  fastify.post("/login", handleLogin);
  fastify.post("/logout", handleLogout);
}
