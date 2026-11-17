import type { Metadata } from "next";

import LoginForm from "@/features/auth/components/LoginForm";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Log in",
  description: `Sign in to ${site.name}. ${site.shortDescription}`,
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage your ActivityPub timeline, followers, and federation settings."
    >
      <LoginForm />
    </AuthShell>
  );
}
