import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../api";
import { authQueryKeys } from "../query-keys";

export function useAuth() {
  const query = useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    user: query.data,
    isAuthenticated: !!query.data,
  };
}
