import { useQuery } from "@tanstack/react-query";

import { getProfileData } from "../api";
import { profileQueryKeys } from "../keys";

export function useProfileData() {
  return useQuery({
    queryKey: profileQueryKeys.public,
    queryFn: getProfileData,
  });
}
