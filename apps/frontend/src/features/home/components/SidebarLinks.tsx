"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  BellIcon,
  UserIcon,
  Settings,
  LogOut,
  Rss,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { useSession } from "@/features/auth/hooks/useSession";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { toast } from "sonner";
import { SettingsDialog } from "./SettingsDialog";

const SidebarLinks = () => {
  const router = useRouter();
  const { endSession } = useSession();
  const logout = useLogout();
  const [settingsOpen, setSettingsOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      endSession();
    } catch {
      toast.error("Unable to logout.");
    }
  }

  return (
    <>
      <Card className="min-w-2/12 bg-transparent border-none mb-auto outline-none shadow-none ring-0 mt-4 p-0">
        <CardContent className="space-y-2 flex flex-col p-0">
          <Button
            variant="default"
            className="w-full justify-start"
            size="lg"
            onClick={() => router.push(routes.dash)}
          >
            <HomeIcon className="size-4 mr-2" />
            Home
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <BellIcon className="size-4 mr-2" />
            Notifications
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="lg"
            onClick={() => router.push(routes.home)}
          >
            <UserIcon className="size-4 mr-2" />
            Your Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="lg"
            onClick={() => router.push(routes.followers)}
          >
            <Users className="size-4 mr-2" />
            Followers
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="lg"
            onClick={() => router.push(routes.following)}
          >
            <Rss className="size-4 mr-2" />
            Following
          </Button>
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="lg"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full justify-start bg-transparent! hover:bg-destructive/10!"
            size="lg"
          >
            <LogOut className="size-4 mr-2" />
            Log Out
          </Button>
        </CardContent>
      </Card>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};

export default SidebarLinks;
