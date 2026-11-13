import { userEndpoints } from "../activitypub/actor.js";
import { getAllAcceptedFollowingActorUri } from "../db/queries/following.js";
import { getTimelineItem } from "../db/queries/timeline.js";
import { serializeTimelineItem } from "./timeline-item.js";
import {
  broadcastTimelineEvent,
  timelineHub,
  type TimelineBroadcast,
} from "./timeline-stream.js";

export async function publishTimelineEvent(input: TimelineBroadcast) {
  try {
    await broadcastTimelineEvent(input, {
      hub: timelineHub,
      localActorUri: userEndpoints.actorUri,
      followedActorUris: getAllAcceptedFollowingActorUri,
      loadItem: async (query) => {
        const row = await getTimelineItem(query);
        return row ? serializeTimelineItem(row) : null;
      },
    });
  } catch (error) {
    console.error("Failed to publish timeline event:", error);
  }
}
