"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HomeFeedView } from "@/features/home/components/HomeFeedView";
import { Separator } from "@/components/ui/separator";
import LeftSidebar from "@/features/home/components/LeftSidebar";
import Image from "next/image";
import logo from "@/assets/logo.png";
import SidebarLinks from "@/features/home/components/SidebarLinks";
import { DashboardLayout } from "@/features/home/components/DashboardLayout";

export default function DashboardPage() {
  const leftSidebar = (
    <>
      <div className="flex items-center gap-2">
        <Image
          src={logo}
          alt="Logo"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <span className="text-xl font-bold text-foreground">SoloSocius</span>
      </div>
      <Separator />
      <LeftSidebar />
    </>
  );

  const rightSidebar = <SidebarLinks />;

  const mainContent = (
    <ScrollArea className="h-[calc(100vh-1rem)] lg:h-[calc(100vh-1rem)]">
      <HomeFeedView />
    </ScrollArea>
  );

  return (
    <main className="bg-background">
      <DashboardLayout leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        {mainContent}
      </DashboardLayout>
    </main>
  );
}
