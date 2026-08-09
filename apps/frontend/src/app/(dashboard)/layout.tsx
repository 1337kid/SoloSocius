"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import LeftSidebar from "@/features/home/components/LeftSidebar";
import SidebarLinks from "@/features/home/components/SidebarLinks";
import { DashboardLayout as DashboardLayoutComponent } from "@/features/home/components/DashboardLayout";
import Logo from "@/features/home/components/Logo";
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
  }

  const leftSidebar = (
    <>
      <Logo />
      <Separator />
      <LeftSidebar />
    </>
  );

  const rightSidebar = <SidebarLinks />;

  const mainContent = (
    <ScrollArea className="h-[calc(100vh-1rem)] lg:h-[calc(100vh-1rem)]">
      {children}
    </ScrollArea>
  );

  return (
    <main className="bg-background">
      <DashboardLayoutComponent leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        {mainContent}
      </DashboardLayoutComponent>
    </main>
  );
}
