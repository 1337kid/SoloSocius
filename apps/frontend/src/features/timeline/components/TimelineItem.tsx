"use client";

import { formatDistanceToNow } from "date-fns";
import purify from "dompurify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Ellipsis, Heart, Repeat, Reply } from "lucide-react";
import type { TimelineActor, TimelineItem } from "../api";
import PostStat from "./PostStat";
import { useInteraction } from "../hooks/useInteraction";

function ActorAvatar({
  actor,
  className = "size-10",
}: {
  actor: TimelineActor;
  className?: string;
}) {
  const name = actor.displayName || actor.username;
  return (
    <Avatar className={`${className} shrink-0 ring-1 ring-border`}>
      {actor.avatarUrl && <AvatarImage src={actor.avatarUrl} alt={name} />}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function ActorHandle({ actor }: { actor: TimelineActor }) {
  const name = actor.displayName || actor.username;
  const handle = `@${actor.username}@${actor.domain}`;
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-semibold text-sm truncate">{name}</p>
      </div>
      <p className="text-xs text-muted-foreground font-mono">{handle}</p>
    </div>
  );
}

export function TimelineItem({
  entry,
  onPostStatsButtonClick,
}: {
  entry: TimelineItem;
  onPostStatsButtonClick: () => void;
}) {
  const { interactWithPost, undoInteractWithPost } = useInteraction();

  const handleBoostInteraction = async (targetPostUri: string) => {
    onPostStatsButtonClick();
    if (!entry.post.boosted) {
      await interactWithPost.mutateAsync({
        targetPostUri,
        type: "boost",
      });
    } else {
      await undoInteractWithPost.mutateAsync({
        targetPostUri,
        type: "boost",
      });
    }
  };

  const handleLikeInteraction = async (targetPostUri: string) => {
    onPostStatsButtonClick();
    if (!entry.post.liked) {
      await interactWithPost.mutateAsync({
        targetPostUri,
        type: "like",
      });
    } else {
      await undoInteractWithPost.mutateAsync({
        targetPostUri,
        type: "like",
      });
    }
  };

  const isBoost = entry.event.type === "boost";

  const postAuthor = entry.post.actor;
  const booster = isBoost ? entry.actor : null;

  const boostedTimeAgo = isBoost
    ? formatDistanceToNow(new Date(entry.event.createdAt), {
        addSuffix: true,
      })
    : undefined;

  const postTimeAgo = formatDistanceToNow(new Date(entry.post.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className="overflow-hidden w-full mx-auto hover:bg-muted/40 hover:shadow-sm transition-all duration-200 bg-card/70 p-0">
      <CardContent className="p-4 space-y-3">
        {/* Boost attribution row */}
        {isBoost && booster && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pl-1">
            <Repeat className="size-4 text-primary" />
            <Avatar className="size-4 ring-0">
              {booster.avatarUrl && (
                <AvatarImage
                  src={booster.avatarUrl}
                  alt={booster.displayName || booster.username}
                />
              )}
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                {(booster.displayName || booster.username)
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>
              <span className="font-medium text-foreground/80">
                {booster.displayName || booster.username}
              </span>{" "}
              boosted {boostedTimeAgo}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <ActorAvatar actor={postAuthor} />
            <ActorHandle actor={postAuthor} />
          </div>
          <time className="text-[11px] text-muted-foreground/70 whitespace-nowrap mt-0.5">
            {postTimeAgo}
          </time>
        </div>

        {/* Reply-to context */}
        {entry.post.inReplyTo && (
          <a
            href={
              entry.post.inReplyTo.url ||
              entry.post.inReplyTo.idUri ||
              entry.post.url ||
              "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="block pl-[52px]"
          >
            <Card className="bg-muted/40 hover:bg-muted transition-colors border-dashed shadow-none p-2">
              <CardContent className="p-0">
                <div className="flex items-start gap-2">
                  <Avatar className="size-6">
                    <AvatarImage
                      src={entry.post.inReplyTo.actor.avatarUrl || undefined}
                    />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {(
                        entry.post.inReplyTo.actor.displayName ||
                        entry.post.inReplyTo.actor.username
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Reply className="size-4 text-primary inline mb-1" />
                      Replying to{" "}
                      <span className="font-medium text-foreground">
                        {entry.post.inReplyTo.actor.displayName ||
                          entry.post.inReplyTo.actor.username}
                      </span>
                      <span className="font-medium text-primary">
                        @{entry.post.inReplyTo.actor.username}@
                        {entry.post.inReplyTo.actor.domain}
                      </span>
                    </p>
                    <div
                      className="mt-0.5 text-xs text-muted-foreground line-clamp-1 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: purify.sanitize(entry.post.inReplyTo.content),
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        )}

        {/* Post content */}
        <div className="text-sm leading-relaxed pl-[52px]">
          <div
            className="prose prose-sm max-w-none **:wrap-break-words [&_*]:overflow-wrap-anywhere [&_a]:text-primary hover:[&_a]:text-primary/80"
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(entry.post.content),
            }}
          />
        </div>

        <div className="flex items-center justify-between ml-[52px]">
          <PostStat
            count={entry.post.replyCount}
            icon={<Reply className="size-4 text-primary" />}
            onClick={() => {}}
            label="Reply"
          />
          <PostStat
            count={entry.post.boostCount}
            active={entry.post.boosted}
            icon={<Repeat className="size-4 text-primary" />}
            onClick={() => handleBoostInteraction(entry.post.idUri)}
            label="Boost"
          />
          <PostStat
            count={entry.post.likeCount}
            active={entry.post.liked}
            icon={
              <Heart
                className={`size-4 text-primary ${entry.post.liked ? "fill-primary" : ""}`}
              />
            }
            onClick={() => handleLikeInteraction(entry.post.idUri)}
            label="Like"
          />
          <PostStat
            icon={<Ellipsis className="size-4 text-primary" />}
            label="More"
          />
        </div>
      </CardContent>
    </Card>
  );
}
