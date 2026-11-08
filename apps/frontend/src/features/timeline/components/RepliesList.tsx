"use client"

import { formatDistanceToNow } from "date-fns"
import purify from "dompurify"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Status } from "@/components/ui/status"

import type { PostReply } from "../api"
import { PostActions } from "./PostActions"
import { PostMediaGrid } from "./PostMediaGrid"

function ReplyItem({ reply }: { reply: PostReply }) {
  const name = reply.actor.displayName || reply.actor.username
  const handle = `@${reply.actor.username}@${reply.actor.domain}`
  const timeAgo = formatDistanceToNow(new Date(reply.createdAt), {
    addSuffix: true,
  })

  return (
    <Status
      name={name}
      handle={handle}
      time={timeAgo}
      avatarUrl={reply.actor.avatarUrl}
      html={purify.sanitize(reply.content)}
      media={<PostMediaGrid mediaItems={reply.mediaItems} />}
      actions={
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
      }
    />
  )
}

export function RepliesList({ replies }: { replies: PostReply[] }) {
  if (replies.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No replies yet</EmptyTitle>
          <EmptyDescription>Be the first to reply.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <section>
      <h2 data-slot="replies-title">Replies ({replies.length})</h2>
      {replies.map((reply) => (
        <ReplyItem key={reply.id} reply={reply} />
      ))}
    </section>
  )
}
