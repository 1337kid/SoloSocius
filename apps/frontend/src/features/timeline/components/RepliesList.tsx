"use client";

import { formatDistanceToNow } from "date-fns";
import purify from "dompurify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { PostReply } from "../api";
import { PostActions } from "./PostActions";
import { PostMediaGrid } from "./PostMediaGrid";

interface RepliesListProps {
  replies: PostReply[];
}

function ReplyItem({ reply }: { reply: PostReply }) {
  const name = reply.actor.displayName || reply.actor.username;
  const handle = `@${reply.actor.username}@${reply.actor.domain}`;

  const timeAgo = formatDistanceToNow(new Date(reply.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className="overflow-hidden w-full mx-auto hover:bg-muted/40 hover:shadow-sm transition-all duration-200 bg-card/70 p-0">
      <CardContent className="p-4 max-sm:p-2 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Avatar className="size-10 shrink-0 ring-1 ring-border">
              {reply.actor.avatarUrl && (
                <AvatarImage src={reply.actor.avatarUrl} alt={name} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm truncate">{name}</p>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {handle}
              </p>
            </div>
          </div>
          <time className="text-[11px] text-muted-foreground/70 whitespace-nowrap mt-0.5">
            {timeAgo}
          </time>
        </div>

        <div className="text-sm leading-relaxed sm:pl-[52px] min-w-0">
          <div
            className="
              prose prose-sm max-w-none min-w-0
              break-words
              [&_*]:break-words
              [&_*]:overflow-wrap-anywhere
              [&_a]:break-all
              [&_a]:whitespace-normal
              [&_a]:text-primary
              hover:[&_a]:text-primary/80"
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(reply.content),
            }}
          />
          <PostMediaGrid mediaItems={reply.mediaItems} />
        </div>

        <div className="sm:ml-[52px]">
          <PostActions
            postId={reply.id}
            postUri={reply.idUri}
            initialLiked={reply.liked}
            initialLikeCount={0}
            initialBoosted={reply.boosted}
            initialBoostCount={0}
            actorDomain={reply.actor.domain}
            postContent={reply.content}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function RepliesList({ replies }: RepliesListProps) {
  if (replies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No replies yet. Be the first to reply!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-4">
      <h3 className="font-semibold text-sm mt-4">Replies ({replies.length})</h3>
      <div className="space-y-2 sm:space-y-3">
        {replies.map((reply) => (
          <ReplyItem key={reply.id} reply={reply} />
        ))}
      </div>
    </div>
  );
}
