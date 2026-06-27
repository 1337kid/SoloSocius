"use client";

import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { TimelinePost } from "../api";

interface TimelineItemProps {
  entry: TimelinePost;
}

export function TimelineItem({ entry }: TimelineItemProps) {
  const isLocal = entry.actor.isLocal;
  const displayName = entry.actor.displayName || entry.actor.username;
  const handle = `@${entry.actor.username}${isLocal ? "" : `@${entry.actor.domain}`}`;

  const timeAgo = formatDistanceToNow(new Date(entry.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary/30 hover:bg-muted/30 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Avatar className="size-10 shrink-0">
              {entry.actor.avatarUrl && (
                <AvatarImage
                  src={entry.actor.avatarUrl}
                  alt={displayName}
                />
              )}
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm truncate">{displayName}</p>
                {isLocal && (
                  <Badge variant="secondary" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{handle}</p>
            </div>
          </div>

          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {timeAgo}
          </time>
        </div>

        {/* Content */}
        <div className="text-sm leading-relaxed line-clamp-4">
          {entry.post.content}
        </div>

        {/* Interactions */}
        {/* {(entry.interactions.likes > 0 || entry.interactions.boosts > 0) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            {entry.interactions.boosts > 0 && (
              <span>{entry.interactions.boosts} boost{entry.interactions.boosts !== 1 ? "s" : ""}</span>
            )}
            {entry.interactions.likes > 0 && (
              <span>{entry.interactions.likes} like{entry.interactions.likes !== 1 ? "s" : ""}</span>
            )}
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}
