import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendInteraction, TimelineResponse, undoInteraction } from "../api";
import { timelineQueryKeys } from "../keys";

export const useInteraction = () => {
  const queryClient = useQueryClient();

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
    onSuccess: (_, { targetPostUri, type }) => {
      queryClient.setQueriesData(
        { queryKey: timelineQueryKeys.lists() },
        (old: TimelineResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.map((item) => {
              if (item.post.idUri !== targetPostUri) return item;

              return {
                ...item,
                post: {
                  ...item.post,
                  liked: type === "like" ? true : item.post.liked,
                  boosted: type === "boost" ? true : item.post.boosted,
                  likeCount:
                    type === "like"
                      ? item.post.likeCount + 1
                      : item.post.likeCount,
                  boostCount:
                    type === "boost"
                      ? item.post.boostCount + 1
                      : item.post.boostCount,
                },
              };
            }),
          };
        },
      );
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

    onSuccess: (_, { targetPostUri, type }) => {
      queryClient.setQueriesData(
        { queryKey: timelineQueryKeys.lists() },
        (old: TimelineResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.map((item) => {
              if (item.post.idUri !== targetPostUri) return item;

              return {
                ...item,
                post: {
                  ...item.post,
                  liked: type === "like" ? false : item.post.liked,
                  boosted: type === "boost" ? false : item.post.boosted,
                  likeCount:
                    type === "like"
                      ? Math.max(0, item.post.likeCount - 1)
                      : item.post.likeCount,
                  boostCount:
                    type === "boost"
                      ? Math.max(0, item.post.boostCount - 1)
                      : item.post.boostCount,
                },
              };
            }),
          };
        },
      );
    },
  });

  return {
    interactWithPost,
    undoInteractWithPost,
  };
};
