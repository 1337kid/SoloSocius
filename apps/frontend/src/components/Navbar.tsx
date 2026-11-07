"use client"

import Link from "next/link"
import { HomeIcon, LogIn, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { useSession } from "@/features/auth/hooks/useSession"
import Logo from "@/features/home/components/Logo"
import { routes } from "@/lib/routes"

const Navbar = () => {
  const { isAuthenticated, isPending } = useAuth()
  const { endSession } = useSession()
  const logout = useLogout()
  const router = useRouter()

  async function handleLogout() {
    try {
      await logout.mutateAsync()
      endSession()
    } catch {
      toast.error("Unable to logout.")
    }
  }

  return (
    <header data-slot="topbar">
      <Logo />
      <div data-slot="topbar-actions">
        {isPending ? (
          <Spinner />
        ) : isAuthenticated ? (
          <>
            <Button variant="ghost" onClick={() => router.push(routes.dash)}>
              <HomeIcon data-icon="inline-start" />
              Dashboard
            </Button>
            <Button
              variant="nav-danger"
              size="default"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              {logout.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <LogOut data-icon="inline-start" />
              )}
              Logout
            </Button>
          </>
        ) : (
          <Button asChild>
            <Link href={routes.login}>
              <LogIn data-icon="inline-start" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}

export default Navbar
