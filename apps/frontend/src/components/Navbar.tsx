"use client";

import Link from "next/link";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSession } from "@/features/auth/hooks/useSession";
import { routes } from "@/lib/routes";
import Image from "next/image";
import logo from "@/assets/logo.png";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <Image src={logo} alt="Logo" width={36} height={36} className="rounded-sm" />
      <span className="font-semibold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
        SoloSocius
      </span>
    </Link>
  );
}

const Navbar = () => {
  const { isAuthenticated, isPending } = useAuth();
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
    <header className="sticky top-0 z-50 w-full border-b border-primary/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-2">
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : isAuthenticated ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              {logout.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              Logout
            </Button>
          ) : (
            <Button asChild className="gap-2">
              <Link href={routes.login}>
                <LogIn className="size-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
