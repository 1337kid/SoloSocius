"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HomeFeedView } from "@/features/home/components/HomeFeedView";
import { Separator } from "@/components/ui/separator";
import LeftSidebar from "@/features/home/components/LeftSidebar";
import Image from "next/image";
import logo from "@/assets/logo.png";
import SidebarLinks from "@/features/home/components/SidebarLinks";
import { useProfileData } from "@/features/profile/hooks/useProfileData";

export default function DashboardPage() {
  return (
    <main className="bg-background">
      <div className="container mx-auto flex gap-3">
        <div className="w-3/12 flex flex-col gap-3 mt-3">
          <div className="flex items-center gap-2">
            <Image
              src={logo}
              alt="Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-foreground">
              SoloSocius
            </span>
          </div>
          <Separator />
          <LeftSidebar />
        </div>
        <Separator
          orientation="vertical"
          className="max-h-dvh bg-primary/50 mt-4"
        />
        <div className="w-7/12 max-h-dvh py-4 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-1rem)]">
            <HomeFeedView />
          </ScrollArea>
        </div>
        <Separator
          orientation="vertical"
          className="max-h-dvh bg-primary/50 mt-4"
        />
        <SidebarLinks />
      </div>
    </main>
  );
}
