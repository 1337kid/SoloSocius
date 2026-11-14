import { FastifyReply, FastifyRequest } from "fastify";
import {
  createRelayFollowActivity,
  createRelayUndoFollowActivity,
} from "../activitypub/activities.js";
import {
  deleteRelayById,
  findRelayById,
  findRelayByInboxUrl,
  insertRelay,
  listRelays,
  markRelayUnsubscribed,
} from "../db/queries/relays.js";
import { relays } from "../db/schema.js";
import jobWorker, { JOB_TYPES } from "../jobs/index.js";
import type { IdParams } from "../validations/common.val.js";
import type { CreateRelayBody } from "../validations/relay.val.js";
import { generateRelayFollowActivityId } from "../utils/activityId.js";

const toRelay = (relay: typeof relays.$inferSelect) => ({
  id: relay.id,
  name: relay.relayName,
  inboxUrl: relay.inboxUrl,
  status: relay.status,
});

const isSubscribed = (status: (typeof relays.$inferSelect)["status"]) =>
  status === "pending" || status === "accepted";

export const getRelays = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const rows = await listRelays();
    return reply.status(200).send(rows.map(toRelay));
  } catch (error) {
    console.error("Failed to list relays:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};

export const addRelay = async (
  request: FastifyRequest<{ Body: CreateRelayBody }>,
  reply: FastifyReply,
) => {
  const { name, inboxUrl } = request.body;

  try {
    const existing = await findRelayByInboxUrl(inboxUrl);
    if (existing) {
      return reply
        .status(409)
        .send({ error: "A relay with this inbox URL already exists." });
    }

    const followActivityId = generateRelayFollowActivityId();

    const relay = await insertRelay(name, inboxUrl, followActivityId);

    await jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
      inboxUrl: relay.inboxUrl,
      activity: createRelayFollowActivity(followActivityId),
      isSystemActor: true,
    });

    return reply.status(201).send(toRelay(relay));
  } catch (error) {
    console.error("Failed to add relay:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};

export const removeRelay = async (
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  try {
    const relay = await findRelayById(id);
    if (!relay) {
      return reply.status(404).send({ error: "Relay not found." });
    }

    if (relay.followActivityId && isSubscribed(relay.status)) {
      await jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
        inboxUrl: relay.inboxUrl,
        activity: createRelayUndoFollowActivity(relay.followActivityId),
        isSystemActor: true,
      });
    }

    await deleteRelayById(id);

    return reply.status(200).send({ message: "Relay removed." });
  } catch (error) {
    console.error("Failed to remove relay:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};

export const unsubscribeRelay = async (
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  try {
    const relay = await findRelayById(id);
    if (!relay) {
      return reply.status(404).send({ error: "Relay not found." });
    }

    if (!relay.followActivityId || !isSubscribed(relay.status)) {
      return reply.status(409).send({ error: "Relay is not subscribed." });
    }

    const updated = await markRelayUnsubscribed(id);
    if (!updated) {
      return reply.status(409).send({ error: "Relay is not subscribed." });
    }

    await jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
      inboxUrl: updated.inboxUrl,
      activity: createRelayUndoFollowActivity(relay.followActivityId),
      isSystemActor: true,
    });

    return reply.status(200).send(toRelay(updated));
  } catch (error) {
    console.error("Failed to unsubscribe from relay:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};
