import type { Metadata } from "next"

import { site } from "@/lib/site"

export const metadata: Metadata = {
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: site.name,
    description: site.description,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: site.name,
    description: site.shortDescription,
  },
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
