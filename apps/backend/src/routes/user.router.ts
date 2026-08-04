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
} from "../controllers/followers.controller.js";

export async function UserRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/search-user",
    { preHandler: [actorLookupMiddleware] },
    handleSearchRemoteUser,
  );

  // Follows
  fastify.post("/follow", handleFollowRemoteUser);
  fastify.delete("/follow", handleUnfollowRemoteUser);

  // Follow requests
  fastify.get("/follow-requests", getAllFollowRequests);
  fastify.post("/follow-requests/toggle", toggleManuallyApprovesFollowers);
  fastify.post("/follow-requests/:id/approve", handleApproveFollowRequest);

  // Profile
  fastify.put("/profile", updateProfileData);
  fastify.delete("/account", deleteAccount);
}
