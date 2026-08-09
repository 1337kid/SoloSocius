import { useMutation } from "@tanstack/react-query";
import {
  deletePostApi,
  sendInteraction,
  undoInteraction,
  updatePostApi,
} from "../api";
import { createPost } from "@/features/home/api";
import { queryClient } from "@/lib/query/client";
import { timelineQueryKeys } from "../keys";
import { feedQueryKeys } from "@/features/home/keys";
import { activityPubContent } from "@/lib/utils";

export const useInteraction = () => {
  const interactWithPost = useMutation({
    mutationFn: ({
      targetPostUri,
      type,
    }: {
      targetPostUri: string;
      type: "like" | "boost";
    }) => {
      return sendInteraction(targetPostUri, type);
    },
  });

  const undoInteractWithPost = useMutation({
    mutationFn: ({
      targetPostUri,
      type,
    }: {
      targetPostUri: string;
      type: "like" | "boost";
    }) => {
      return undoInteraction(targetPostUri, type);
    },
  });

  const replyToPost = useMutation({
    mutationFn: ({
      inReplyTo,
      reply,
      mediaItems,
    }: {
      inReplyTo: string;
      reply: string;
      mediaItems?: import("@/features/home/api").UploadedAttachment[];
    }) => {
      const content = activityPubContent(reply);
      return createPost({
        content,
        inReplyTo,
        mediaItems: mediaItems?.map((m) => ({ url: m.url, mimeType: m.mimeType })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timelineQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: timelineQueryKeys.details() });
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.lists() });
    },
  });

  const deletePost = useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return deletePostApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timelineQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: timelineQueryKeys.details() });
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.lists() });
    },
  });

  const updatePost = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => {
      return updatePostApi(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timelineQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: timelineQueryKeys.details() });
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.lists() });
    },
  });

  return {
    interactWithPost,
    undoInteractWithPost,
    replyToPost,
    deletePost,
    updatePost,
  };
};
