import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { DOMAIN } from "../config/env.js";
import { eq } from "drizzle-orm";
import { webfingerResponse } from "../activitypub/webfinger.js";

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

  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!adminUser)
    return reply
      .status(404)
      .send({ error: "Account handle not found on this server instance." });

  const response = webfingerResponse(adminUser.username, DOMAIN);

  return reply.status(200).send(response);
};
