"use client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HomeIcon,
  BellIcon,
  UserIcon,
  Settings,
  LogOut,
  Rss,
  Users,
  Edit,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { useSession } from "@/features/auth/hooks/useSession";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { toast } from "sonner";
import { useProfileData } from "@/features/profile/hooks/useProfileData";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EditProfileDialog } from "@/features/profile/components/EditProfileDialog";
import { SettingsDialog } from "@/features/home/components/SettingsDialog";

interface MobileProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileProfileSheet({
  open,
  onOpenChange,
}: MobileProfileSheetProps) {
  const router = useRouter();
  const { data: profileData } = useProfileData();
  const { endSession } = useSession();
  const logout = useLogout();
  const [settingsOpen, setSettingsOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      endSession();
      onOpenChange(false);
    } catch {
      toast.error("Unable to logout.");
    }
  }

  const handleNavigation = (route: string) => {
    router.push(route);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-xl border-t-2"
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {profileData?.avatarUrl && (
                    <AvatarImage src={profileData.avatarUrl} />
                  )}
                  <AvatarFallback>
                    {profileData?.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <SheetTitle className="text-left text-lg">
                    {profileData?.displayName}
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.username}@{profileData?.domain}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>
                      <strong>{profileData?.postsCount || 0}</strong> posts
                    </span>
                    <span>
                      <strong>{profileData?.followersCount || 0}</strong>{" "}
                      followers
                    </span>
                    <span>
                      <strong>{profileData?.followingCount || 0}</strong>{" "}
                      following
                    </span>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <EditProfileDialog />
                </Dialog>
              </div>
            </SheetHeader>

            <Separator />

            <div className="flex-1 py-4 space-y-2 px-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={() => handleNavigation(routes.dash)}
              >
                <HomeIcon className="h-5 w-5 mr-3" />
                Home
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={() => {}}
              >
                <BellIcon className="h-5 w-5 mr-3" />
                Notifications
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={() => handleNavigation(routes.home)}
              >
                <UserIcon className="h-5 w-5 mr-3" />
                Your Profile
              </Button>

              {profileData?.manuallyApprovesFollowers && (
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={() => handleNavigation(routes.followRequests)}
                >
                  <UserPlus className="h-5 w-5 mr-3" />
                  Follow Requests
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={() => handleNavigation(routes.followers)}
              >
                <Users className="h-5 w-5 mr-3" />
                Followers
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={() => handleNavigation(routes.following)}
              >
                <Rss className="h-5 w-5 mr-3" />
                Following
              </Button>

              <Separator className="my-4" />

              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                onClick={() => {
                  setSettingsOpen(true);
                  onOpenChange(false);
                }}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Button>

              <Button
                onClick={handleLogout}
                disabled={logout.isPending}
                className="w-full justify-start h-12 bg-transparent hover:bg-destructive/10 text-destructive"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Log Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
