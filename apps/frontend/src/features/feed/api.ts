import { api } from "@/lib/api/axios";
import type { TimelineResponse } from "@/features/timeline/api";

export async function getHomeFeed(page: number = 1): Promise<TimelineResponse> {
  const { data } = await api.get<TimelineResponse>("/feed", {
    params: { page },
  });
  return data;
}
