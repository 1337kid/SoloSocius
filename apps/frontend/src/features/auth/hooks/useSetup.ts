import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setup } from "../api";
import { authQueryKeys } from "../query-keys";

export function useSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.me,
      });

      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.status,
      });
    },
  });
}
