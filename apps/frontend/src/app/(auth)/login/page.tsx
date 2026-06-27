import LoginForm from "@/features/auth/components/LoginForm";
import { AuthShell } from "@/features/auth/components/AuthShell";

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
