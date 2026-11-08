"use client";

import { useParams } from "next/navigation";
import { PostDetailView } from "@/features/timeline/components/PostDetailView";

export default function PostPage() {
  const params = useParams();
  const postId = params.postId as string;

  return postId ? (
    <PostDetailView postId={postId} />
  ) : (
    <div data-slot="center-state">
      <p>Invalid post ID</p>
    </div>
  );
}
