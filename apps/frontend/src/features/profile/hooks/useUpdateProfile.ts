import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateProfileRequest } from "@solosocius/api-types";

import { updateProfile } from "../api";
import { profileQueryKeys } from "../keys";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: UpdateProfileRequest) => updateProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.public });
    },
  });
}
