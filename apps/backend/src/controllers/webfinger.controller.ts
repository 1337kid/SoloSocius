import { FastifyRequest, FastifyReply } from "fastify";
import { webfingerResponse } from "../activitypub/webfinger.js";
import {
  checkActorOnThisInstance,
  getActorOnThisInstance,
} from "../db/queries/actor.js";
import { DOMAIN } from "../config/env.js";
import type { WebFingerQuery } from "../validations/webfinger.val.js";
import { userEndpoints, systemUserEndpoints } from "../activitypub/actor.js";
import { SYSTEM_ACTOR_USERNAME } from "../activitypub/constants.js";

export const handleWebFinger = async (
  req: FastifyRequest<{ Querystring: WebFingerQuery }>,
  reply: FastifyReply,
) => {
  const { resource } = req.query;

  try {
    if (resource.startsWith("https://")) {
      if (resource === userEndpoints.actorUri) {
        const user = await getActorOnThisInstance();

        return reply
          .status(200)
          .send(webfingerResponse(user.username, userEndpoints.actorUri));
      }

      if (resource === systemUserEndpoints.actorUri) {
        return reply
          .status(200)
          .send(
            webfingerResponse(
              SYSTEM_ACTOR_USERNAME,
              systemUserEndpoints.actorUri,
            ),
          );
      }

      return reply.status(404).send({
        error: "Actor not found.",
      });
    }

    const accountTarget = resource.replace(/^acct:/, "");
    const [username, userDomain] = accountTarget.split("@");

    if (userDomain !== DOMAIN) {
      return reply.status(404).send({
        error: "Account handle not found on this server instance.",
      });
    }

    if (username === SYSTEM_ACTOR_USERNAME) {
      return reply
        .status(200)
        .send(webfingerResponse(username, systemUserEndpoints.actorUri));
    }

    if (!(await checkActorOnThisInstance(username))) {
      return reply.status(404).send({
        error: "Account handle not found on this server instance.",
      });
    }

    return reply
      .status(200)
      .send(webfingerResponse(username, userEndpoints.actorUri));
  } catch (error) {
    console.error("WebFinger error:", error);

    return reply.status(500).send({
      error: "Internal Server Error",
    });
  }
};
