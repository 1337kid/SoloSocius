import type { Metadata } from "next";

import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <AuthRouteGuard>{children}</AuthRouteGuard>
    </main>
  );
}

