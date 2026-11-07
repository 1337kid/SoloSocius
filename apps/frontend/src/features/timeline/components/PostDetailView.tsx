"use client"

import { formatDistanceToNow } from "date-fns"
import purify from "dompurify"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ColumnHeader } from "@/components/ui/shell"
import { Status, StatusSkeleton } from "@/components/ui/status"

import { usePostDetail } from "../hooks/usePostDetail"
import type { PostWithReplies } from "../api"
import { PostActions } from "./PostActions"
import { PostMediaGrid } from "./PostMediaGrid"
import { RepliesList } from "./RepliesList"

function PostDetailContent({ post }: { post: PostWithReplies }) {
  const name = post.actor.displayName || post.actor.username
  const handle = `@${post.actor.username}@${post.actor.domain}`
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  })

  return (
    <>
      <Status
        variant="detail"
        name={name}
        handle={handle}
        time={timeAgo}
        avatarUrl={post.actor.avatarUrl}
        html={purify.sanitize(post.content)}
        media={<PostMediaGrid mediaItems={post.mediaItems} />}
        actions={
          <PostActions
            postId={post.id}
            postUri={post.idUri}
            initialLiked={post.liked}
            initialLikeCount={post.likeCount}
            initialBoosted={post.boosted}
            initialBoostCount={post.boostCount}
            actorDomain={post.actor.domain}
            postContent={post.content}
          />
        }
      />
      <RepliesList replies={post.replies} />
      {post.isLocal === false ? (
        <Alert data-slot="remote-note">
          <AlertTitle>Remote post</AlertTitle>
          <AlertDescription>
            This post is not local. Some replies may be missing.
          </AlertDescription>
          <Button variant="link" asChild>
            <Link href={post.url || post.idUri} target="_blank">
              View on {post.actor.domain}
              <ExternalLink data-icon="inline-end" />
            </Link>
          </Button>
        </Alert>
      ) : null}
    </>
  )
}

export function PostDetailView({ postId }: { postId: string }) {
  const router = useRouter()
  const { data: post, isLoading, isError, error } = usePostDetail(postId)

  return (
    <>
      <ColumnHeader>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1>Post</h1>
        </div>
      </ColumnHeader>
      {isLoading ? (
        <StatusSkeleton />
      ) : isError || !post ? (
        <div data-slot="center-state">
          <p>
            {error instanceof Error ? error.message : "Post not found"}
          </p>
        </div>
      ) : (
        <PostDetailContent post={post} />
      )}
    </>
  )
}
