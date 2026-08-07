"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { MobileBottomNav } from "./mobile/MobileBottomNav";
import { MobileComposeDialog } from "./mobile/MobileComposeDialog";
import { MobileProfileSheet } from "./mobile/MobileProfileSheet";
import DiscoverDialog from "@/features/home/components/DiscoverDialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
  leftSidebar: React.ReactNode;
  rightSidebar: React.ReactNode;
}

export function DashboardLayout({
  children,
  leftSidebar,
  rightSidebar,
}: DashboardLayoutProps) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);

  return (
    <>
      <div className="hidden lg:flex gap-3 container mx-auto">
        <div className="w-3/12 flex flex-col gap-3 mt-3">{leftSidebar}</div>
        <Separator
          orientation="vertical"
          className="max-h-dvh bg-primary/50 mt-4"
        />
        <div className="w-7/12 max-h-dvh py-4 overflow-hidden">{children}</div>
        <Separator
          orientation="vertical"
          className="max-h-dvh bg-primary/50 mt-4"
        />
        <div className="w-2/12 mt-4">{rightSidebar}</div>
      </div>

      <div className="lg:hidden">
        <div className="pb-20 px-4 pt-4">{children}</div>

        <MobileBottomNav
          onComposeClick={() => setComposeOpen(true)}
          onSearchClick={() => setDiscoverOpen(true)}
          onProfileClick={() => setProfileOpen(true)}
        />
      </div>

      <MobileComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />

      <MobileProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />

      <DiscoverDialog open={discoverOpen} onOpenChange={setDiscoverOpen} />
    </>
  );
}
