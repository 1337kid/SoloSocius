"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  SearchIcon,
  PlusIcon,
  BellIcon,
  UserIcon,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { routes } from "@/lib/routes";

interface MobileBottomNavProps {
  onComposeClick: () => void;
  onSearchClick: () => void;
  onProfileClick: () => void;
}

export function MobileBottomNav({
  onComposeClick,
  onSearchClick,
  onProfileClick,
}: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      icon: HomeIcon,
      label: "Home",
      isActive: pathname === routes.dash,
      onClick: () => router.push(routes.dash),
    },
    {
      icon: SearchIcon,
      label: "Search",
      isActive: false,
      onClick: onSearchClick,
    },
    {
      icon: PlusIcon,
      label: "Compose",
      isActive: false,
      onClick: onComposeClick,
      isCompose: true,
    },
    {
      icon: BellIcon,
      label: "Notifications",
      isActive: false,
      onClick: () => {},
    },
    {
      icon: UserIcon,
      label: "Profile",
      isActive: false,
      onClick: onProfileClick,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="bg-background/90 backdrop-blur-md border-t border-border/60 px-4 py-2 shadow-lg">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map(
            ({ icon: Icon, label, isActive, onClick, isCompose }) => (
              <Button
                key={label}
                variant={isCompose ? "default" : isActive ? "default" : "ghost"}
                className={cn(
                  "h-12 flex-col gap-1 text-xs font-normal",
                  isCompose &&
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                  isActive && !isCompose && "bg-primary/10 text-primary",
                  !isActive &&
                    !isCompose &&
                    "text-muted-foreground hover:text-foreground",
                )}
                onClick={onClick}
                aria-label={label}
              >
                <Icon className={cn("h-5 w-5", isCompose && "h-6 w-6")} />
                <span className="text-[10px] leading-none">{label}</span>
              </Button>
            ),
          )}
        </div>
      </div>
    </nav>
  );
}
