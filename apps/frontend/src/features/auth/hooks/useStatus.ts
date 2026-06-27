import { useQuery } from "@tanstack/react-query";

import { getStatus } from "../api";
import { authQueryKeys } from "../query-keys";

export function useStatus() {
  return useQuery({
    queryKey: authQueryKeys.status,
    queryFn: getStatus,
    staleTime: Infinity,
  });
}
