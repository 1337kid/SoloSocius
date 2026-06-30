"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HomeFeedView } from "@/features/home/components/HomeFeedView";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BellIcon,
  HomeIcon,
  LogOut,
  SearchIcon,
  Settings,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProfileCard from "@/features/home/components/ProfileCard";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { ButtonGroup } from "@/components/ui/button-group";
import SidebarLinks from "@/features/home/components/SidebarLinks";
  
export default function DashboardPage() {
  return (
    <main className="bg-background">
      <div className="container mx-auto flex gap-3">
        <div className="min-w-3/12 flex flex-col gap-3 mt-3">
          <div className="flex items-center gap-2">
            <Image
              src={logo}
              alt="Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-foreground">
              SoloSocius
            </span>
          </div>
          <Separator />
          <ProfileCard />
        </div>
        <Separator
          orientation="vertical"
          className="max-h-dvh bg-primary/50 mt-4"
        />
        <div className="max-h-dvh py-4 overflow-hidden">
          <Field className="mb-3">
            <ButtonGroup>
              <Input
                id="input-button-group"
                placeholder="Type to search..."
                className="h-9"
              />
              <Button variant="outline" size="lg">
                <SearchIcon className="size-4" />
              </Button>
            </ButtonGroup>
          </Field>{" "}
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <HomeFeedView />
          </ScrollArea>
        </div>
        <Separator
          orientation="vertical"
          className="max-h-dvh bg-primary/50 mt-4"
        />
        <SidebarLinks />
      </div>
    </main>
  );
}
