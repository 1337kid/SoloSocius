import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfileData, Profile, updateProfile } from "../api";
import { profileQueryKeys } from "../keys";

export function useProfileData() {
  return useQuery({
    queryKey: profileQueryKeys.public,
    queryFn: getProfileData,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: Profile) => updateProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.public });
    },
  });
}
