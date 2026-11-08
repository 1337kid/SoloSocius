"use client";

import {
  BellIcon,
  HomeIcon,
  LogOut,
  Pencil,
  Rss,
  Settings,
  UserIcon,
  UserPlus,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSession } from "@/features/auth/hooks/useSession";
import { EditProfileDialog } from "@/features/profile/components/EditProfileDialog";
import { useProfileData } from "@/features/profile/hooks/useProfileData";
import { isSettingsItemActive, settingsNav } from "@/features/settings/nav";
import ProfileStat from "@/features/timeline/components/ProfileStat";
import { matchesRoute, routes } from "@/lib/routes";

interface MobileProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileProfileSheet({
  open,
  onOpenChange,
}: MobileProfileSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: profileData } = useProfileData();
  const { endSession } = useSession();
  const logout = useLogout();
  const name = profileData?.displayName || profileData?.username || "";
  const inSettings = matchesRoute(pathname, routes.settings);

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      endSession();
      onOpenChange(false);
    } catch {
      toast.error("Unable to logout.");
    }
  }

  const go = (route: string) => {
    router.push(route);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" size="tall">
          <SheetHeader>
            <div data-slot="profile-identity">
              <Avatar size="lg">
                {profileData?.avatarUrl ? (
                  <AvatarImage src={profileData.avatarUrl} alt={name} />
                ) : null}
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle>{name}</SheetTitle>
                <p data-slot="post-handle">
                  @{profileData?.username}@{profileData?.domain}
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Edit profile"
                  >
                    <Pencil />
                  </Button>
                </DialogTrigger>
                <EditProfileDialog />
              </Dialog>
            </div>
            <div data-slot="stat-row">
              <ProfileStat text="Posts" value={profileData?.postsCount ?? 0} />
              <ProfileStat
                text="Followers"
                value={profileData?.followersCount ?? 0}
                href={routes.followers}
              />
              <ProfileStat
                text="Following"
                value={profileData?.followingCount ?? 0}
                href={routes.following}
              />
            </div>
          </SheetHeader>
          <Separator />
          <div data-slot="sheet-body">
            <Button
              variant="nav"
              size="lg"
              data-active={matchesRoute(pathname, routes.dash) || undefined}
              aria-current={matchesRoute(pathname, routes.dash) ? "page" : undefined}
              onClick={() => go(routes.dash)}
            >
              <HomeIcon data-icon="inline-start" />
              Home
            </Button>
            <Button variant="nav" size="lg">
              <BellIcon data-icon="inline-start" />
              Notifications
            </Button>
            <Button
              variant="nav"
              size="lg"
              data-active={matchesRoute(pathname, routes.home) || undefined}
              aria-current={matchesRoute(pathname, routes.home) ? "page" : undefined}
              onClick={() => go(routes.home)}
            >
              <UserIcon data-icon="inline-start" />
              Profile
            </Button>
            {profileData?.manuallyApprovesFollowers ? (
              <Button
                variant="nav"
                size="lg"
                data-active={matchesRoute(pathname, routes.followRequests) || undefined}
                aria-current={
                  matchesRoute(pathname, routes.followRequests) ? "page" : undefined
                }
                onClick={() => go(routes.followRequests)}
              >
                <UserPlus data-icon="inline-start" />
                Follow requests
              </Button>
            ) : null}
            <Button
              variant="nav"
              size="lg"
              data-active={matchesRoute(pathname, routes.followers) || undefined}
              aria-current={
                matchesRoute(pathname, routes.followers) ? "page" : undefined
              }
              onClick={() => go(routes.followers)}
            >
              <Users data-icon="inline-start" />
              Followers
            </Button>
            <Button
              variant="nav"
              size="lg"
              data-active={matchesRoute(pathname, routes.following) || undefined}
              aria-current={
                matchesRoute(pathname, routes.following) ? "page" : undefined
              }
              onClick={() => go(routes.following)}
            >
              <Rss data-icon="inline-start" />
              Following
            </Button>
            <Separator />
            <Button
              variant="nav"
              size="lg"
              data-active={inSettings || undefined}
              aria-current={inSettings ? "page" : undefined}
              onClick={() => go(routes.settings)}
            >
              <Settings data-icon="inline-start" />
              Settings
            </Button>
            {inSettings ? (
              <div data-slot="nav-children">
                {settingsNav.map((item) => {
                  const active = isSettingsItemActive(pathname, item.href);
                  return (
                    <Button
                      key={item.href}
                      variant="nav-child"
                      size="sm"
                      data-active={active || undefined}
                      aria-current={active ? "page" : undefined}
                      onClick={() => go(item.href)}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            ) : null}
            <Button
              variant="nav-danger"
              size="lg"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              {logout.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <LogOut data-icon="inline-start" />
              )}
              Log out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
