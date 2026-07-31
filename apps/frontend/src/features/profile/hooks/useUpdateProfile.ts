import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Profile, updateProfile } from "../api";
import { profileQueryKeys } from "../keys";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: Profile) => updateProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.public });
    },
  });
}
