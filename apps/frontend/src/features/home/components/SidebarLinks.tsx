"use client"

import {
  BellIcon,
  HomeIcon,
  LogOut,
  Rss,
  Settings,
  UserIcon,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { useSession } from "@/features/auth/hooks/useSession"
import { useProfileData } from "@/features/profile/hooks/useProfileData"
import { isSettingsItemActive, settingsNav } from "@/features/settings/nav"
import { routes } from "@/lib/routes"

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
  const inSettings = isCurrent(pathname, routes.settings)

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
      <Button
        variant="nav"
        size="lg"
        asChild
        data-active={inSettings || undefined}
        aria-current={inSettings ? "page" : undefined}
      >
        <Link href={routes.settings}>
          <Settings data-icon="inline-start" />
          Settings
        </Link>
      </Button>
      {inSettings ? (
        <div data-slot="nav-children">
          {settingsNav.map((item) => {
            const active = isSettingsItemActive(pathname, item.href)
            return (
              <Button
                key={item.href}
                variant="nav-child"
                size="sm"
                asChild
                data-active={active || undefined}
                aria-current={active ? "page" : undefined}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            )
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
    </>
  )
}

export default SidebarLinks
