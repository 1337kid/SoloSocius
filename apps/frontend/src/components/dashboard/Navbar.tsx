"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSession } from "@/features/auth/hooks/useSession";
import { toast } from "sonner";

const Navbar = () => {
  const { endSession } = useSession();
  const logout = useLogout();

  async function handleLogout() {
    try {
      await logout.mutateAsync();

      endSession();
    } catch {
      toast.error("Unable to logout.");
    }
  }

  return (
    <Button disabled={logout.isPending} onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default Navbar;
