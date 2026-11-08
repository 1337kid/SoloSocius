import { routes } from "@/lib/routes"

export const settingsNav = [
  {
    label: "Account",
    href: routes.settings,
    description: "Follow requests and account preferences.",
  },
  {
    label: "Delete account",
    href: routes.settingsDelete,
    description: "Permanently remove this account.",
  },
] as const

export function isSettingsItemActive(pathname: string, href: string) {
  if (href === routes.settings) return pathname === routes.settings
  return pathname === href || pathname.startsWith(`${href}/`)
}
