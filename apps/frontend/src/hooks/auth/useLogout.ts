import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/keys";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: queryKeys.me,
      });
    },
  });
}
