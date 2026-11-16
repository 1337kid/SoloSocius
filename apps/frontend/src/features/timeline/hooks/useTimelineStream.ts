"use client";

import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { TimelineStream } from "@solosocius/api-types";
import { feedQueryKeys } from "@/features/home/keys";
import { timelineQueryKeys } from "../keys";
import { applyStreamEvent, type TimelineCache } from "../stream/apply-stream-event";
import { getTimelineStream } from "../stream/client";

function queryKeyFor(stream: TimelineStream) {
  if (stream === "user") return feedQueryKeys.lists();
  if (stream === "public") return feedQueryKeys.federated();
  if (stream.startsWith("account:")) return timelineQueryKeys.user(stream);
  return timelineQueryKeys.lists();
}

export function useTimelineStream(stream: TimelineStream, queryKey?: QueryKey) {
  const queryClient = useQueryClient();
  const keyId = JSON.stringify(queryKey ?? queryKeyFor(stream));

  useEffect(() => {
    const key = JSON.parse(keyId) as QueryKey;
    return getTimelineStream().subscribe(
      stream,
      (frame) => {
        queryClient.setQueryData<TimelineCache>(key, (current) => {
          if (!current) return current;
          return applyStreamEvent(current, frame);
        });
      },
      () => {
        void queryClient.invalidateQueries({ queryKey: key });
      },
    );
  }, [queryClient, stream, keyId]);
}
