import { FastifyReply, FastifyRequest } from "fastify";
import { count } from "drizzle-orm";
import { DOMAIN, SOFTWARE_NAME, SOFTWARE_VERSION } from "../config/env.js";
import { getActorOnThisInstance } from "../db/queries/actor.js";
import { getLocalPostsCount } from "../db/queries/posts.js";

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
          rel: "http://nodeinfo.diaspora.technology/spec/2.0",
          href: `https://${DOMAIN}/nodeinfo/2.0`,
        },
      ],
    });
}

export async function getNodeInfo(request: FastifyRequest, reply: FastifyReply) {
    const actor = await getActorOnThisInstance();
    const localPostsCount = await getLocalPostsCount();

  return reply
    .status(200)
    .type(
      'application/json; profile="http://nodeinfo.diaspora.technology/spec/2.0#"',
    )
    .send({
      version: "2.0",
      software: {
        name: SOFTWARE_NAME,
        version: SOFTWARE_VERSION,
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
        nodeName: "SoloSocius",
        nodeDescription: "A single-user ActivityPub federated node.",
      },
    });
}
