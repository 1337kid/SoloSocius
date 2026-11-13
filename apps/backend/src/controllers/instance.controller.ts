import { FastifyReply, FastifyRequest } from "fastify";
import { getActorOnThisInstance } from "../db/queries/actor.js";
import { getLocalPostsCount } from "../db/queries/posts.js";
import instanceConfig from "../config/instance.json" with { type: "json" };
import { DOMAIN } from "../config/env.js";

export async function getInstanceInfo(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const actor = await getActorOnThisInstance();
  const localPostsCount = await getLocalPostsCount();

  const instanceInfo = {
    uri: DOMAIN,
    title: instanceConfig.name,
    short_description: instanceConfig.short_description,
    description: instanceConfig.description,
    version: instanceConfig.version,
    languages: instanceConfig.language,
    email: instanceConfig.email,
    stats: {
      user_count: actor ? 1 : 0,
      post_count: localPostsCount,
    },
    registrations: false,
    approval_required: true,
    invites_enabled: false,
  };

  return reply.status(200).type("application/json").send(instanceInfo);
}
