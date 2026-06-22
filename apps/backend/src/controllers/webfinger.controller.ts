import { FastifyRequest, FastifyReply } from "fastify";
import { webfingerResponse } from "../activitypub/webfinger.js";
import { checkActorOnThisInstance } from "../db/queries/actor.js";
import { DOMAIN } from "../config/env.js";

export const handleWebFinger = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const { resource } = req.query as { resource?: string };

  if (!resource || !resource.startsWith("acct:")) {
    return reply
      .status(400)
      .send({ error: "Missing or invalid resource query parameter." });
  }

  const accountTarget = resource?.replace("acct:", "");
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
};
