"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/auth/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const auth = useAuth();

  useEffect(() => {
    if (auth.isError) {
      router.replace("/login");
    }
  }, [auth.isError, router]);

  if (auth.isPending || !auth.user) {
    return <p>Loading...</p>;
  } else {
    return children;
  }
}
