import { FastifyReply, FastifyRequest } from "fastify";
import { DOMAIN } from "../config/env.js";
import { getActorOnThisInstance } from "../db/queries/actor.js";
import { getLocalPostsCount } from "../db/queries/posts.js";
import instanceConfig from "../config/instance.json" with { type: "json" };
import { NODEINFO_SCHEMA } from "../activitypub/constants.js";

export async function nodeinfoRoutes(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply
    .status(200)
    .type("application/json")
    .send({
      links: [
        {
          rel: NODEINFO_SCHEMA,
          href: `https://${DOMAIN}/nodeinfo/2.0`,
        },
      ],
    });
}

export async function getNodeInfo(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const actor = await getActorOnThisInstance();
  const localPostsCount = await getLocalPostsCount();

  return reply
    .status(200)
    .type(`application/json; profile="${NODEINFO_SCHEMA}#"`)
    .send({
      version: "2.0",
      software: {
        name: instanceConfig.software,
        version: instanceConfig.version,
        homepage: instanceConfig.homepage,
      },
      protocols: ["activitypub"],
      services: {
        inbound: [],
        outbound: [],
      },
      openRegistrations: false,
      usage: {
        users: {
          total: actor ? 1 : 0,
          activeHalfyear: actor ? 1 : 0,
          activeMonth: actor ? 1 : 0,
        },
        localPosts: localPostsCount,
      },
      metadata: {
        nodeName: instanceConfig.name,
        nodeDescription: instanceConfig.description,
        repositoryUrl: instanceConfig.repositoryUrl,
        feedbackUrl: instanceConfig.feedbackUrl,
      },
    });
}
