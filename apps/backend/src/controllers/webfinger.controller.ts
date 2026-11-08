import { FastifyRequest, FastifyReply } from "fastify";
import { webfingerResponse } from "../activitypub/webfinger.js";
import { checkActorOnThisInstance } from "../db/queries/actor.js";
import { DOMAIN } from "../config/env.js";
import type { WebFingerQuery } from "../validations/webfinger.val.js";

export const handleWebFinger = async (
  req: FastifyRequest<{ Querystring: WebFingerQuery }>,
  reply: FastifyReply,
) => {
  const { resource } = req.query;

  try {
    const accountTarget = resource.replace("acct:", "");
    const [username, userDomain] = accountTarget.split("@");

    if (userDomain !== DOMAIN)
      return reply
        .status(404)
        .send({ error: "Account handle not found on this server instance." });

    if (!(await checkActorOnThisInstance(username)))
      return reply
        .status(404)
        .send({ error: "Account handle not found on this server instance." });

    const response = webfingerResponse(username);

    return reply.status(200).send(response);
  } catch (error) {
    console.log("Error: ", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};
