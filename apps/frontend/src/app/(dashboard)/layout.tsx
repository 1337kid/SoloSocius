"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { onSessionExpired } from "@/features/auth/events";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSession } from "@/features/auth/hooks/useSession";
import { routes } from "@/lib/routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const auth = useAuth();
  const { endSession } = useSession();
  useEffect(() => {
    return onSessionExpired(endSession);
  }, [endSession]);

  useEffect(() => {
    if (auth.isError) {
      router.replace(routes.login);
    }
  }, [auth.isError, router]);

  if (auth.isPending || !auth.user) {
    return <p>Loading...</p>;
  } else {
    return children;
  }
}
