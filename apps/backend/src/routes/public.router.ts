import { FastifyInstance } from "fastify";

import { getPublicTimeline } from "../controllers/timeline.controller.js";
import { validatePagination } from "../middlewares/validatePagination.js";
import { getProfileData } from "../controllers/user.controller.js";
import { handleGetAllFollowers } from "../controllers/followers.controller.js";

export async function PublicRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/timeline",
    { preHandler: [validatePagination] },
    getPublicTimeline,
  );

  fastify.get("/profile", getProfileData);
  fastify.get("/followers", handleGetAllFollowers);
}
  