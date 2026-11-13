import { InboxActivity } from "../../types/index.js";
import { getPostFromDB, removeRemoteActorPost } from "../../db/queries/posts.js";
import { publishTimelineEvent } from "../../services/publish-timeline.js";

export const handleDeleteActivity = async (activity: InboxActivity) => {
  const postUri =
    typeof activity.object === "string"
      ? activity.object
      : activity.object?.type === "Tombstone"
        ? activity.object.id
        : null;

  if (!postUri) return;

  const post = await getPostFromDB(postUri);
  if (!post || post.actorUri !== activity.actor) return;

  await removeRemoteActorPost(activity.actor, postUri);
  await publishTimelineEvent({
    kind: "delete",
    postId: post.id,
    actorUri: post.actorUri,
    eventType: "post",
  });
};
