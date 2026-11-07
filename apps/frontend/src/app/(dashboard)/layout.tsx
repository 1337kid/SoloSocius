"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import LeftSidebar from "@/features/home/components/LeftSidebar";
import SidebarLinks from "@/features/home/components/SidebarLinks";
import { DashboardLayout as DashboardLayoutComponent } from "@/features/home/components/DashboardLayout";
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
    return (
      <div data-slot="center-state">
        <Spinner />
      </div>
    );
  }

  return (
    <DashboardLayoutComponent navigation={<SidebarLinks />} rail={<LeftSidebar />}>
      {children}
    </DashboardLayoutComponent>
  );
}
