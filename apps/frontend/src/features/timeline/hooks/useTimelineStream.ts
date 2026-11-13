"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TimelineStream } from "@solosocius/api-types";
import { feedQueryKeys } from "@/features/home/keys";
import { timelineQueryKeys } from "../keys";
import { applyStreamEvent, type TimelineCache } from "../stream/apply-stream-event";
import { getTimelineStream } from "../stream/client";

function queryKeyFor(stream: TimelineStream) {
  if (stream === "user") return feedQueryKeys.lists();
  if (stream === "public") return feedQueryKeys.federated();
  return timelineQueryKeys.lists();
}

export function useTimelineStream(stream: TimelineStream) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return getTimelineStream().subscribe(
      stream,
      (frame) => {
        queryClient.setQueryData<TimelineCache>(queryKeyFor(stream), (current) => {
          if (!current) return current;
          return applyStreamEvent(current, frame);
        });
      },
      () => {
        void queryClient.invalidateQueries({ queryKey: queryKeyFor(stream) });
      },
    );
  }, [queryClient, stream]);
}
