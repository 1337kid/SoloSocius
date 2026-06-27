import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "../api";
import { authQueryKeys } from "../query-keys";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.me,
      });
    },
  });
}
