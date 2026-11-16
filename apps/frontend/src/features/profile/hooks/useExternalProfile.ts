import { useQuery } from "@tanstack/react-query";

import { getExternalProfile } from "../api";
import { profileQueryKeys } from "../keys";

export function useExternalProfile(webfinger: string, enabled = true) {
  return useQuery({
    queryKey: profileQueryKeys.externalProfile(webfinger),
    queryFn: () => getExternalProfile(webfinger),
    enabled: enabled && webfinger.length > 0,
  });
}
