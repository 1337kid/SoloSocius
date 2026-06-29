import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfileData, Profile, updateProfile } from "../api";

export function useProfileData() {
  return useQuery({ queryKey: ["publicProfile"], queryFn: getProfileData });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: Profile) => updateProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicProfile"] });
    },
  });
}
