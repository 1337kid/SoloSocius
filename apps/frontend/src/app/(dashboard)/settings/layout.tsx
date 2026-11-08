import { ColumnHeader } from "@/components/ui/shell"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ColumnHeader>
        <div>
          <h1>Settings</h1>
          <p>Account preferences</p>
        </div>
      </ColumnHeader>
      {children}
    </>
  )
}
