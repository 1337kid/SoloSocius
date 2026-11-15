import { ActorObject, InboxActivity } from "../../types/index.js";
import { addActorToDB } from "../../db/queries/actor.js";
import { getPostFromDB, updateRemotePost } from "../../db/queries/posts.js";
import { MediaItem } from "../../db/schema.js";
import { parseMediaItems, remotePostLookup } from "../../utils/activitypub.js";
import { publishTimelineEvent } from "../../services/publish-timeline.js";
import { createAndPublishTimelineEntry } from "../../utils/timeline.js";

const actorKeysToCheck = [
  "id",
  "type",
  "preferredUsername",
  "inbox",
  "publicKey",
];

export const handleUpdateActivity = async (activity: InboxActivity) => {
  if (typeof activity.object !== "string") {
    switch (activity.object?.type) {
      case "Person":
        try {
          const actor = activity.object;
          if (activity.actor !== activity.object.id) {
            throw new Error(
              "Not updating actor because it is not the same as the actor",
            );
          }

          const hasAllKeys = actorKeysToCheck.every((key) => key in actor);
          if (!hasAllKeys) {
            throw new Error(
              "Not updating actor because it does not have all required keys",
            );
          }

          const update: Partial<ActorObject> = {
            actorUri: actor.id,
            username: actor.preferredUsername,
            domain: new URL(actor.id).hostname,
          };

          if ("name" in actor) update.displayName = actor.name;

          if ("summary" in actor) update.summary = actor.summary;

          if ("icon" in actor && "url" in actor.icon)
            update.avatarUrl = actor.icon.url;

          if ("image" in actor && "url" in actor.image)
            update.bannerUrl = actor.image.url;

          if ("publicKey" in actor && "publicKeyPem" in actor.publicKey)
            update.publicKey = actor.publicKey.publicKeyPem;

          if ("inbox" in actor) update.inboxUrl = actor.inbox;

          if ("endpoints" in actor && "sharedInbox" in actor.endpoints)
            update.sharedInboxUrl = actor.endpoints.sharedInbox;

          if ("publicKey" in actor && "id" in actor.publicKey)
            update.publicKeyId = actor.publicKey.id;

          await addActorToDB(update as ActorObject);
        } catch (error) {
          console.error("Not updating actor because of error:", error);
          break;
        }
        break;

      case "Note":
        try {
          const postObject = activity.object;

          const existingPost = await getPostFromDB(postObject.id);

          if (existingPost) {
            let mediaItems: MediaItem[] = parseMediaItems(
              postObject.attachment,
            );

            await updateRemotePost(existingPost.idUri, {
              content: postObject.content,
              mediaItems,
            });

            await publishTimelineEvent({
              kind: "status.update",
              postUri: existingPost.idUri,
            });
            return;
          }

          const post = await remotePostLookup(postObject.id);

          await createAndPublishTimelineEntry(
            post.actorUri,
            post.idUri,
            "post",
          );
        } catch (error) {
          console.error("Not updating post because of error:", error);
          break;
        }
        break;
      default:
        return;
    }
  }
};
