"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HomeFeedView } from "@/features/home/components/HomeFeedView";
import { Separator } from "@/components/ui/separator";
import LeftSidebar from "@/features/home/components/LeftSidebar";
import SidebarLinks from "@/features/home/components/SidebarLinks";
import { DashboardLayout } from "@/features/home/components/DashboardLayout";
import Logo from "@/features/home/components/Logo";

export default function DashboardPage() {
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
