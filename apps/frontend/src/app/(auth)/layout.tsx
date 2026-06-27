import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen">
      <AuthRouteGuard>{children}</AuthRouteGuard>
    </main>
  );
}

