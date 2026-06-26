import { getCurrentUser } from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/keys";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const query = useQuery({
    queryKey: queryKeys.me,
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
