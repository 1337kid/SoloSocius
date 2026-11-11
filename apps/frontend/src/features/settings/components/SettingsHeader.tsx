"use client"

import { usePathname } from "next/navigation"

import { isSettingsItemActive, settingsNav } from "@/features/settings/nav"
import { routes } from "@/lib/routes"

export function SettingsHeader() {
  const pathname = usePathname()
  const current = settingsNav.find((item) =>
    isSettingsItemActive(pathname, item.href),
  )
  const description =
    pathname === routes.settings
      ? "Account preferences"
      : (current?.description ?? "Account preferences")

  return (
    <div>
      <h1>Settings</h1>
      <p>{description}</p>
    </div>
  )
}
