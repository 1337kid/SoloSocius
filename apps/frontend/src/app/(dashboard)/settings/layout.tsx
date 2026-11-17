import type { Metadata } from "next"

import { ColumnHeader } from "@/components/ui/shell"
import { SettingsHeader } from "@/features/settings/components/SettingsHeader"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Settings",
  description: `Account and server settings for this ${site.name} instance.`,
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ColumnHeader>
        <SettingsHeader />
      </ColumnHeader>
      {children}
    </>
  )
}
