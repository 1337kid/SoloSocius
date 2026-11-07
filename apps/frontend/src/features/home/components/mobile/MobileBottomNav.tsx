"use client"

import {
  BellIcon,
  HomeIcon,
  PlusIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"

interface MobileBottomNavProps {
  onComposeClick: () => void
  onSearchClick: () => void
  onProfileClick: () => void
}

export function MobileBottomNav({
  onComposeClick,
  onSearchClick,
  onProfileClick,
}: MobileBottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav data-slot="mobile-nav" aria-label="Main navigation">
      <Button
        variant="tab"
        size="tab"
        data-active={pathname === routes.dash || undefined}
        onClick={() => router.push(routes.dash)}
      >
        <HomeIcon />
        Home
      </Button>
      <Button variant="tab" size="tab" onClick={onSearchClick}>
        <SearchIcon />
        Search
      </Button>
      <Button variant="default" size="compose" onClick={onComposeClick} aria-label="Compose">
        <PlusIcon />
      </Button>
      <Button variant="tab" size="tab">
        <BellIcon />
        Alerts
      </Button>
      <Button variant="tab" size="tab" onClick={onProfileClick}>
        <UserIcon />
        Profile
      </Button>
    </nav>
  )
}
