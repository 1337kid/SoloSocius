import { FastifyInstance } from "fastify";
import {
  handleFollowRemoteUser,
  handleSearchRemoteUser,
  handleUnfollowRemoteUser,
} from "../controllers/following.controller.js";
import { updateProfileData } from "../controllers/user.controller.js";
import { actorLookupMiddleware } from "../middlewares/actorLookup.js";

export async function UserRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/search-user",
    { preHandler: [actorLookupMiddleware] },
    handleSearchRemoteUser,
  );
  fastify.post("/follow", handleFollowRemoteUser);
  fastify.delete("/follow", handleUnfollowRemoteUser);

  fastify.put("/profile", updateProfileData);
}
