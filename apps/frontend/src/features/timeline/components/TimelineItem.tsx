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
    <Card className="overflow-hidden border-l-[3px] border-l-primary/50 hover:border-l-primary hover:bg-muted/40 hover:shadow-sm transition-all duration-200 bg-card/70 p-0">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Avatar className="size-10 shrink-0 ring-1 ring-border">
              {entry.actor.avatarUrl && (
                <AvatarImage
                  src={entry.actor.avatarUrl}
                  alt={displayName}
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm truncate">{displayName}</p>
                {isLocal && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">{handle}</p>
            </div>
          </div>

          <time className="text-[11px] text-muted-foreground/70 whitespace-nowrap mt-0.5">
            {timeAgo}
          </time>
        </div>

        {/* Content */}
        <div className="text-sm leading-relaxed line-clamp-4 text-foreground/90 pl-[52px]">
          {entry.post.content}
        </div>
      </CardContent>
    </Card>
  );
}
