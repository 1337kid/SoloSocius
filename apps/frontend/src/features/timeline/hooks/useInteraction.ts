import { useMutation } from "@tanstack/react-query";
import { sendInteraction, undoInteraction } from "../api";

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

  return {
    interactWithPost,
    undoInteractWithPost,
  };
};
