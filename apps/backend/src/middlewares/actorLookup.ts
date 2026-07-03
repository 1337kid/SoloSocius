import { FastifyRequest, FastifyReply } from "fastify";
import { remoteActorLookup } from "../utils/activitypub.js";
import { webfingerLookup } from "../utils/activitypub.js";

export const actorLookupMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { handle } = request.body as { handle: string };

  if (!handle || !handle.includes("@")) {
    return reply.status(400).send({
      error: "Valid federated handle target required (user@domain.com).",
    });
  }

  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
  const [, remoteDomain] = cleanHandle.split("@");

  try {
    const webfingerResponse = await webfingerLookup(remoteDomain, cleanHandle);

    if (!webfingerResponse.ok) {
      return reply
        .status(500)
        .send({ error: "Error fetching webfinger of user" });
    }

    const webfingerData = await webfingerResponse.json();

    const selfLink = webfingerData.links?.find((l: any) => l.rel === "self");

    if (!selfLink || !selfLink.href) {
      return reply
        .status(404)
        .send({ error: "ActivityPub profile target URI lookup failed." });
    }

    const remoteProfileUri = selfLink.href;

    const remoteActor = await remoteActorLookup(remoteProfileUri);

    (request as any).remoteActor = remoteActor;
  } catch (error) {
    console.error("Failed looking up actor:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};
