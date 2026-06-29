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
        <Card className="min-w-3/12 bg-transparent border-none mb-auto outline-none shadow-none ring-0 mt-4">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-2 flex flex-col">
            <Button
              variant="default"
              className="w-full justify-start"
              size="lg"
            >
              <HomeIcon className="size-4 mr-2" />
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <BellIcon className="size-4 mr-2" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <UserIcon className="size-4 mr-2" />
              Your Profile
            </Button>
            <Separator />
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <Settings className="size-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start bg-transparent! hover:bg-destructive/10!"
              size="lg"
            >
              <LogOut className="size-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
