import type { Metadata } from "next"

import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Following",
  description: `Accounts this ${site.name} instance follows. ${site.shortDescription}`,
  alternates: { canonical: "/following" },
  openGraph: {
    title: `Following · ${site.name}`,
    description: `Accounts this ${site.name} instance follows.`,
    url: "/following",
  },
  twitter: {
    card: "summary",
    title: `Following · ${site.name}`,
    description: `Accounts this ${site.name} instance follows.`,
  },
}

export default function FollowingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
