import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../index.js";
import { timelineEvents } from "../schema.js";
import { userEndpoints } from "../../activitypub/actor.js";

interface timelineEvent {
  type: "post" | "boost";
  actorUri: string;
  postUri: string;
}

export const createTimelineEntry = async ({
  type,
  actorUri,
  postUri,
}: timelineEvent) => {
  await db.insert(timelineEvents).values({
    type,
    actorUri,
    postUri,
  });
};

export const removeTimelineEntry = async (postUri: string) => {
  await db.delete(timelineEvents).where(eq(timelineEvents.postUri, postUri));
};

export const removeTimelineBoostEntry = async (
  postUri: string,
  actorUri: string,
) => {
  await db
    .delete(timelineEvents)
    .where(
      and(
        eq(timelineEvents.postUri, postUri),
        eq(timelineEvents.actorUri, actorUri),
        eq(timelineEvents.type, "boost"),
      ),
    );
};

export const getFeedEvents = async (
  actorUris: string[],
  limit: number,
  offset: number,
) => {
  return await db.query.timelineEvents.findMany({
    with: {
      actor: {
        columns: {
          actorUri: true,
          avatarUrl: true,
          username: true,
          domain: true,
        },
      },
      post: {
        with: {
          actor: {
            columns: {
              actorUri: true,
              avatarUrl: true,
              username: true,
              domain: true,
            },
          },
        },
      },
    },
    where: inArray(timelineEvents.actorUri, actorUris),
    orderBy: desc(timelineEvents.createdAt),
    limit,
    offset,
  });
};

export const getProfileTimeline = async (limit: number, offset: number) => {
  return await db.query.timelineEvents.findMany({
    with: {
      actor: {
        columns: {
          actorUri: true,
          avatarUrl: true,
          username: true,
          domain: true,
        },
      },
      post: {
        with: {
          inReplyTo: {
            columns: {
              content: true,
              url: true,
              idUri: true,
            },
            with: {
              actor: {
                columns: {
                  actorUri: true,
                  avatarUrl: true,
                  username: true,
                  domain: true,
                },
              },
            },
          },
          actor: {
            columns: {
              actorUri: true,
              avatarUrl: true,
              username: true,
              domain: true,
            },
          },
        },
      },
    },
    where: eq(timelineEvents.actorUri, userEndpoints.actorUri),
    orderBy: desc(timelineEvents.createdAt),
    limit,
    offset,
  });
};
