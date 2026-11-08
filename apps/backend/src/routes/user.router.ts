import { FastifyInstance } from "fastify";
import {
  handleFollowRemoteUser,
  handleSearchRemoteUser,
  handleUnfollowRemoteUser,
} from "../controllers/following.controller.js";
import {
  updateProfileData,
  deleteAccount,
  toggleManuallyApprovesFollowers,
} from "../controllers/user.controller.js";
import { actorLookupMiddleware } from "../middlewares/actorLookup.js";
import {
  getAllFollowRequests,
  handleApproveFollowRequest,
  handleRejectFollow,
} from "../controllers/followers.controller.js";
import { defaultPageRouteSchema } from "../validations/pagination.val.js";
import {
  actorUriRouteSchema,
  followRequestIdRouteSchema,
  searchUserRouteSchema,
} from "../validations/social.val.js";
import {
  deleteAccountRouteSchema,
  updateProfileRouteSchema,
} from "../validations/user.val.js";

export async function UserRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/search-user",
    { schema: searchUserRouteSchema, preHandler: [actorLookupMiddleware] },
    handleSearchRemoteUser,
  );

  // Follows
  fastify.post("/follow", { schema: actorUriRouteSchema }, handleFollowRemoteUser);
  fastify.delete(
    "/follow",
    { schema: actorUriRouteSchema },
    handleUnfollowRemoteUser,
  );

  // Follow requests
  fastify.get(
    "/follow-requests",
    { schema: defaultPageRouteSchema },
    getAllFollowRequests,
  );
  fastify.post("/follow-requests/toggle", toggleManuallyApprovesFollowers);
  fastify.post(
    "/follow-requests/:id/approve",
    { schema: followRequestIdRouteSchema },
    handleApproveFollowRequest,
  );
  fastify.delete(
    "/follow-requests/:id",
    { schema: followRequestIdRouteSchema },
    handleRejectFollow,
  );

  // Profile
  fastify.put("/profile", { schema: updateProfileRouteSchema }, updateProfileData);
  fastify.delete("/account", { schema: deleteAccountRouteSchema }, deleteAccount);
}
