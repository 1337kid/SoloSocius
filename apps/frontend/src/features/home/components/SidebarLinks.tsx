"use client"

import { useState } from "react"
import {
  BellIcon,
  HomeIcon,
  LogOut,
  Rss,
  Settings,
  UserIcon,
  Users,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { useSession } from "@/features/auth/hooks/useSession"
import { useProfileData } from "@/features/profile/hooks/useProfileData"
import { routes } from "@/lib/routes"

import { SettingsDialog } from "./SettingsDialog"

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

const SidebarLinks = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { data: profileData } = useProfileData()
  const { endSession } = useSession()
  const logout = useLogout()
  const [settingsOpen, setSettingsOpen] = useState(false)

  async function handleLogout() {
    try {
      await logout.mutateAsync()
      endSession()
    } catch {
      toast.error("Unable to logout.")
    }
  }

  const items = [
    { label: "Home", href: routes.dash, icon: HomeIcon },
    { label: "Notifications", href: "", icon: BellIcon },
    { label: "Profile", href: routes.home, icon: UserIcon },
    ...(profileData?.manuallyApprovesFollowers
      ? [{ label: "Follow requests", href: routes.followRequests, icon: Users }]
      : []),
    { label: "Followers", href: routes.followers, icon: Users },
    { label: "Following", href: routes.following, icon: Rss },
  ]

  return (
    <>
      {items.map(({ label, href, icon: Icon }) => (
        <Button
          key={label}
          variant="nav"
          size="lg"
          data-active={href ? isCurrent(pathname, href) : undefined}
          aria-current={href && isCurrent(pathname, href) ? "page" : undefined}
          onClick={() => {
            if (href) router.push(href)
          }}
        >
          <Icon data-icon="inline-start" />
          {label}
        </Button>
      ))}
      <Separator />
      <Button variant="nav" size="lg" onClick={() => setSettingsOpen(true)}>
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
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}

export default SidebarLinks
