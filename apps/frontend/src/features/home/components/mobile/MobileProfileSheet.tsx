"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { useSession } from "@/features/auth/hooks/useSession"
import { EditProfileDialog } from "@/features/profile/components/EditProfileDialog"
import { useProfileData } from "@/features/profile/hooks/useProfileData"
import ProfileStat from "@/features/timeline/components/ProfileStat"
import { routes } from "@/lib/routes"

import { SettingsDialog } from "../SettingsDialog"

interface MobileProfileSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileProfileSheet({
  open,
  onOpenChange,
}: MobileProfileSheetProps) {
  const router = useRouter()
  const { data: profileData } = useProfileData()
  const { endSession } = useSession()
  const logout = useLogout()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const name = profileData?.displayName || profileData?.username || ""

  async function handleLogout() {
    try {
      await logout.mutateAsync()
      endSession()
      onOpenChange(false)
    } catch {
      toast.error("Unable to logout.")
    }
  }

  const go = (route: string) => {
    router.push(route)
    onOpenChange(false)
  }

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
                  <Button variant="outline" size="icon" aria-label="Edit profile">
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
            <Button variant="nav" size="lg" onClick={() => go(routes.dash)}>
              <HomeIcon data-icon="inline-start" />
              Home
            </Button>
            <Button variant="nav" size="lg">
              <BellIcon data-icon="inline-start" />
              Notifications
            </Button>
            <Button variant="nav" size="lg" onClick={() => go(routes.home)}>
              <UserIcon data-icon="inline-start" />
              Profile
            </Button>
            {profileData?.manuallyApprovesFollowers ? (
              <Button
                variant="nav"
                size="lg"
                onClick={() => go(routes.followRequests)}
              >
                <UserPlus data-icon="inline-start" />
                Follow requests
              </Button>
            ) : null}
            <Button variant="nav" size="lg" onClick={() => go(routes.followers)}>
              <Users data-icon="inline-start" />
              Followers
            </Button>
            <Button variant="nav" size="lg" onClick={() => go(routes.following)}>
              <Rss data-icon="inline-start" />
              Following
            </Button>
            <Separator />
            <Button
              variant="nav"
              size="lg"
              onClick={() => {
                setSettingsOpen(true)
                onOpenChange(false)
              }}
            >
              <Settings data-icon="inline-start" />
              Settings
            </Button>
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
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
