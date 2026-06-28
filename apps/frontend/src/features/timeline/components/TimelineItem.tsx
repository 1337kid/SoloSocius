"use client";

import { formatDistanceToNow } from "date-fns";
import purify from "dompurify";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Ellipsis, Heart, Repeat, Reply } from "lucide-react";

import type { TimelineActor, TimelineItem } from "../api";
import { Button } from "@/components/ui/button";
import PostStat from "./PostStat";

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

export function TimelineItem({ entry }: { entry: TimelineItem }) {
  const isBoost = entry.event.type === "boost";

  const postAuthor = entry.post.actor;
  const booster = isBoost ? entry.actor : null;

  const timeAgo = formatDistanceToNow(new Date(entry.event.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className="overflow-hidden border-l-[3px] border-l-primary/50 hover:border-l-primary hover:bg-muted/40 hover:shadow-sm transition-all duration-200 bg-card/70 p-0">
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
              boosted
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <ActorAvatar actor={postAuthor} />
            <ActorHandle actor={postAuthor} />
          </div>
          <time className="text-[11px] text-muted-foreground/70 whitespace-nowrap mt-0.5">
            {timeAgo}
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
        <div className="text-sm leading-relaxed line-clamp-4 text-foreground/90 pl-[52px]">
          <div
            className="prose prose-sm max-w-none [&_a]:text-primary hover:[&_a]:text-primary/80 [&_a]:truncate"
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(entry.post.content),
            }}
          />
        </div>

        <div className="flex items-center justify-between ml-[52px]">
          <PostStat
            count={entry.post.replyCount}
            icon={<Reply className="size-4 text-primary" />}
          />
          <PostStat
            count={entry.post.boostCount}
            icon={<Repeat className="size-4 text-primary" />}
          />
          <PostStat
            count={entry.post.likeCount}
            icon={<Heart className="size-4 text-primary" />}
          />
          <PostStat icon={<Ellipsis className="size-4 text-primary" />} />
        </div>
      </CardContent>
    </Card>
  );
}
