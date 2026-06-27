import SetupForm from "@/features/auth/components/SetupForm";
import { AuthShell } from "@/features/auth/components/AuthShell";

export default function SetupPage() {
  return (
    <AuthShell
      title="Set up your instance"
      description="Create the admin account for this single-user ActivityPub node. This user becomes the sole actor on this server."
    >
      <SetupForm />
    </AuthShell>
  );
}
