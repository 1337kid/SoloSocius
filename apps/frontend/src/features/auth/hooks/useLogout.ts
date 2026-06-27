import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "../api";
import { authQueryKeys } from "../query-keys";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: authQueryKeys.me,
      });
    },
  });
}
