import type { Metadata } from "next"

import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Followers",
  description: `Accounts that follow this ${site.name} instance. ${site.shortDescription}`,
  alternates: { canonical: "/followers" },
  openGraph: {
    title: `Followers · ${site.name}`,
    description: `Accounts that follow this ${site.name} instance.`,
    url: "/followers",
  },
  twitter: {
    card: "summary",
    title: `Followers · ${site.name}`,
    description: `Accounts that follow this ${site.name} instance.`,
  },
}

export default function FollowersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
