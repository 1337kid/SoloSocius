import { useMutation } from "@tanstack/react-query";
import { sendInteraction, undoInteraction } from "../api";
import { createPost } from "@/features/home/api";
import { queryClient } from "@/lib/query/client";
import { timelineQueryKeys } from "../keys";
import { feedQueryKeys } from "@/features/home/keys";

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
    }: {
      inReplyTo: string;
      reply: string;
    }) => {
      return createPost({ content: reply, inReplyTo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timelineQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.lists() });
    },
  });

  return { interactWithPost, undoInteractWithPost, replyToPost };
};
