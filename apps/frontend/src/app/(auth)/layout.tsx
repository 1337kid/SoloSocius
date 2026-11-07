import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard";

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

