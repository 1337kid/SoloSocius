"use client";

import { formatDistanceToNow } from "date-fns";
import purify from "dompurify";
import { Repeat, Reply } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Status } from "@/components/ui/status";
import { routes } from "@/lib/routes";

import type { TimelineItem as TimelineEntry } from "../api";
import { PostActions } from "./PostActions";
import { PostMediaGrid } from "./PostMediaGrid";

export function TimelineItem({
  entry,
  onPostStatsButtonClick,
}: {
  entry: TimelineEntry;
  onPostStatsButtonClick: () => void;
}) {
  const isBoost = entry.event.type === "boost";
  const postAuthor = entry.post.actor;
  const booster = isBoost ? entry.actor : null;
  const name = postAuthor.displayName || postAuthor.username;
  const handle = `@${postAuthor.username}@${postAuthor.domain}`;
  const postTimeAgo = formatDistanceToNow(new Date(entry.post.createdAt), {
    addSuffix: true,
  });

  const parent = entry.post.inReplyTo;
  const parentActor = parent?.actor;

  return (
    <Status
      name={name}
      handle={handle}
      time={postTimeAgo}
      avatarUrl={postAuthor.avatarUrl}
      html={purify.sanitize(entry.post.content)}
      href={routes.post(entry.post.id)}
      media={<PostMediaGrid mediaItems={entry.post.mediaItems} />}
      boost={
        isBoost && booster ? (
          <p data-slot="post-boost">
            <Repeat />
            <Avatar size="sm">
              {booster.avatarUrl ? (
                <AvatarImage
                  src={booster.avatarUrl}
                  alt={booster.displayName || booster.username}
                />
              ) : null}
              <AvatarFallback>
                {(booster.displayName || booster.username)
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>
              {booster.displayName || booster.username} boosted{" "}
              {formatDistanceToNow(new Date(entry.event.createdAt), {
                addSuffix: true,
              })}
            </span>
          </p>
        ) : null
      }
      context={
        parent ? (
          <a
            data-slot="post-context"
            href={parent.url || parent.idUri || entry.post.url || "#"}
            target="_blank"
            className="bg-accent p-2 rounded-md"
            rel="noopener noreferrer"
          >
            <Avatar size="sm">
              {parentActor?.avatarUrl ? (
                <AvatarImage src={parentActor.avatarUrl} />
              ) : null}
              <AvatarFallback>
                {(parentActor?.displayName || parentActor?.username || "?")
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p data-slot="post-handle">
                <Reply /> Replying to{" "}
                <span data-slot="post-name">
                  {parentActor?.displayName ||
                    parentActor?.username ||
                    "Unknown"}
                </span>
              </p>
              <div
                data-slot="post-context-body"
                dangerouslySetInnerHTML={{
                  __html: purify.sanitize(parent.content),
                }}
              />
            </div>
          </a>
        ) : null
      }
      actions={
        <PostActions
          postId={entry.post.id}
          postUri={entry.post.idUri}
          initialLiked={entry.post.liked}
          initialLikeCount={entry.post.likeCount}
          initialBoosted={entry.post.boosted}
          initialBoostCount={entry.post.boostCount}
          actorDomain={entry.post.actor.domain}
          postContent={entry.post.content}
          onInteract={onPostStatsButtonClick}
        />
      }
    />
  );
}
