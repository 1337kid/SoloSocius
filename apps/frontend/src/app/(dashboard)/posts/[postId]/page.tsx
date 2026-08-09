"use client";

import { useParams } from "next/navigation";
import { PostDetailView } from "@/features/timeline/components/PostDetailView";

export default function PostPage() {
  const params = useParams();
  const postId = params.postId as string;

  return postId ? (
    <PostDetailView postId={postId} />
  ) : (
    <div className="container max-w-2xl mx-auto p-4">
      <div className="text-center py-8">
        <p className="text-muted-foreground">Invalid post ID</p>
      </div>
    </div>
  );
}
