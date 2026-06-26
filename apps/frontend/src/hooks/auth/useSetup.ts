import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setup } from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/keys";

export function useSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setup,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.me,
      });
    },
  });
}
