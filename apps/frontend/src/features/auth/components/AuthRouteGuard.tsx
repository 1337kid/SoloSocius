"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { routes } from "@/lib/routes";

import { useStatus } from "../hooks/useStatus";
import { AuthShell } from "./AuthShell";

export function AuthRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const status = useStatus();

  useEffect(() => {
    if (!status.data) {
      return;
    }

    if (status.data.configured && pathname === routes.setup) {
      router.replace(routes.login);
    }

    if (!status.data.configured && pathname === routes.login) {
      router.replace(routes.setup);
    }
  }, [pathname, router, status.data]);

  if (status.isPending) {
    return (
      <AuthShell
        loading
        title="Loading"
        description="Checking instance configuration."
      />
    );
  }

  if (status.data?.configured && pathname === routes.setup) {
    return null;
  }

  if (!status.data?.configured && pathname === routes.login) {
    return null;
  }

  return children;
}
