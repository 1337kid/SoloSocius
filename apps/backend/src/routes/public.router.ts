import { FastifyInstance } from "fastify";

import { getPublicTimeline } from "../controllers/timeline.controller.js";
import { getProfileData } from "../controllers/user.controller.js";
import { handleGetAllFollowers } from "../controllers/followers.controller.js";
import { handleGetAllFollowing } from "../controllers/following.controller.js";
import { defaultPageRouteSchema } from "../validations/pagination.val.js";

export async function PublicRoutes(fastify: FastifyInstance) {
  fastify.get("/timeline", { schema: defaultPageRouteSchema }, getPublicTimeline);

  fastify.get("/profile", getProfileData);
  fastify.get(
    "/followers",
    { schema: defaultPageRouteSchema },
    handleGetAllFollowers,
  );
  fastify.get(
    "/following",
    { schema: defaultPageRouteSchema },
    handleGetAllFollowing,
  );
}
