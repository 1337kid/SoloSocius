import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { routes } from "@/lib/routes";

export function useSession() {
  const router = useRouter();
  const queryClient = useQueryClient();

  function endSession() {
    queryClient.clear();
    router.replace(routes.login);
  }

  return {
    endSession,
  };
}
