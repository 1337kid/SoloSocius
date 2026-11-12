import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../index.js";
import { relays } from "../schema.js";

const subscribedStatuses = ["pending", "accepted"] as const;

export const listRelays = async () => {
  return db.select().from(relays).orderBy(asc(relays.relayName));
};

export const findRelayById = async (id: string) => {
  const [relay] = await db
    .select()
    .from(relays)
    .where(eq(relays.id, id))
    .limit(1);

  return relay;
};

export const findRelayByFollowActivityId = async (followActivityId: string) => {
  const [relay] = await db
    .select()
    .from(relays)
    .where(eq(relays.followActivityId, followActivityId))
    .limit(1);

  return relay;
};

export const findRelayByInboxUrl = async (inboxUrl: string) => {
  const [relay] = await db
    .select()
    .from(relays)
    .where(eq(relays.inboxUrl, inboxUrl))
    .limit(1);

  return relay;
};

export const insertRelay = async (
  relayName: string,
  inboxUrl: string,
  followActivityId: string,
) => {
  const [relay] = await db
    .insert(relays)
    .values({ relayName, inboxUrl, followActivityId, status: "pending" })
    .returning();

  return relay;
};

export const deleteRelayById = async (id: string) => {
  const [relay] = await db
    .delete(relays)
    .where(eq(relays.id, id))
    .returning({ id: relays.id });

  return relay;
};

export const markRelayUnsubscribed = async (id: string) => {
  const [relay] = await db
    .update(relays)
    .set({ status: "unsubscribed" })
    .where(
      and(eq(relays.id, id), inArray(relays.status, [...subscribedStatuses])),
    )
    .returning();

  return relay;
};

export const markRelayAccepted = async (id: string) => {
  const [relay] = await db
    .update(relays)
    .set({ status: "accepted" })
    .where(and(eq(relays.id, id), eq(relays.status, "pending")))
    .returning({ id: relays.id });

  return relay;
};

export const markRelayRejected = async (id: string) => {
  const [relay] = await db
    .update(relays)
    .set({ status: "rejected" })
    .where(and(eq(relays.id, id), eq(relays.status, "pending")))
    .returning({ id: relays.id });

  return relay;
};
