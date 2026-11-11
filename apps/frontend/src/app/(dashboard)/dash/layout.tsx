"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ColumnHeader } from "@/components/ui/shell"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { routes } from "@/lib/routes"

export default function DashFeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const value = pathname === routes.federated ? "federated" : "home"

  return (
    <>
      <ColumnHeader>
        <Tabs className="w-full" value={value} onValueChange={() => {}}>
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="home" asChild>
              <Link href={routes.dash}>Your feed</Link>
            </TabsTrigger>
            <TabsTrigger value="federated" asChild>
              <Link href={routes.federated}>Federated</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </ColumnHeader>
      {children}
    </>
  )
}
