"use client";
import { formatDistanceToNow } from "date-fns";
import purify from "dompurify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePostDetail } from "../hooks/usePostDetail";
import { PostActions } from "./PostActions";
import { RepliesList } from "./RepliesList";
import { PostMediaGrid } from "./PostMediaGrid";
import type { PostWithReplies } from "../api";
import Link from "next/link";

function PostDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-32 w-full" />
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

function PostDetailContent({ post }: { post: PostWithReplies }) {
  const name = post.actor.displayName || post.actor.username;
  const handle = `@${post.actor.username}@${post.actor.domain}`;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="space-y-2">
      <Card className="overflow-hidden w-full">
        <CardContent className="space-y-2 px-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <Avatar className="size-12 shrink-0 ring-1 ring-border">
                {post.actor.avatarUrl && (
                  <AvatarImage src={post.actor.avatarUrl} alt={name} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{name}</p>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {handle}
                </p>
              </div>
              <time className="text-xs text-muted-foreground/70">
                {timeAgo}
              </time>
            </div>
          </div>

          <div className="text-base leading-relaxed">
            <div
              className="
                prose prose-base max-w-none min-w-0
                break-words
                [&_*]:break-words
                [&_*]:overflow-wrap-anywhere
                [&_a]:break-all
                [&_a]:whitespace-normal
                [&_a]:text-primary
                hover:[&_a]:text-primary/80"
              dangerouslySetInnerHTML={{
                __html: purify.sanitize(post.content),
              }}
            />
            <PostMediaGrid mediaItems={post.mediaItems} />
          </div>

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
        </CardContent>
      </Card>

      <RepliesList replies={post.replies} />

      {post.isLocal === false && (
        <div className="my-4 max-sm:mb-16 max-sm:mt-3 mx-auto w-full flex justify-center">
          <Button variant="link" asChild>
            <Link href={post.url || post.idUri} target="_blank">
              View post on {post.actor.domain}
              <ExternalLink className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

interface PostDetailViewProps {
  postId: string;
}

const BackButton = () => {
  const router = useRouter();
  return (
    <div className="mt-2 mb-5">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="size-4 mr-2" />
        Back
      </Button>
    </div>
  );
};

export function PostDetailView({ postId }: PostDetailViewProps) {
  const { data: post, isLoading, isError, error } = usePostDetail(postId);

  if (isLoading) {
    return (
      <div>
        <BackButton />
        <PostDetailSkeleton />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div>
        <BackButton />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Post not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <PostDetailContent post={post} />
    </div>
  );
}
