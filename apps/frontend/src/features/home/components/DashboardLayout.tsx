"use client"

import { useState } from "react"

import {
  Shell,
  ShellColumns,
  ShellFeed,
  ShellMobileBar,
  ShellNav,
  ShellRail,
} from "@/components/ui/shell"

import DiscoverDialog from "./DiscoverDialog"
import Logo from "./Logo"
import { MobileBottomNav } from "./mobile/MobileBottomNav"
import { MobileComposeDialog } from "./mobile/MobileComposeDialog"
import { MobileProfileSheet } from "./mobile/MobileProfileSheet"
import { routes } from "@/lib/routes"

interface DashboardLayoutProps {
  children: React.ReactNode
  navigation: React.ReactNode
  rail: React.ReactNode
}

export function DashboardLayout({
  children,
  navigation,
  rail,
}: DashboardLayoutProps) {
  const [composeOpen, setComposeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [discoverOpen, setDiscoverOpen] = useState(false)

  return (
    <Shell>
      <ShellMobileBar>
        <Logo href={routes.dash} />
      </ShellMobileBar>
      <ShellColumns>
        <ShellNav>
          <Logo href={routes.dash} />
          {navigation}
        </ShellNav>
        <ShellFeed>{children}</ShellFeed>
        <ShellRail>{rail}</ShellRail>
      </ShellColumns>
      <MobileBottomNav
        onComposeClick={() => setComposeOpen(true)}
        onSearchClick={() => setDiscoverOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
      />
      <MobileComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
      <MobileProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
      <DiscoverDialog open={discoverOpen} onOpenChange={setDiscoverOpen} />
    </Shell>
  )
}
