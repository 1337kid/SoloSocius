import { ColumnHeader } from "@/components/ui/shell"
import { SettingsHeader } from "@/features/settings/components/SettingsHeader"

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
