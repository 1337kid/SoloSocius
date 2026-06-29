"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HomeFeedView } from "@/features/feed/components/HomeFeedView";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useProfileData } from "@/features/profile/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PencilIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EditProfileDialog } from "@/features/feed/components/EditProfileDialog";
import { DialogTrigger, Dialog } from "@/components/ui/dialog";

export default function DashboardPage() {
  const { data: profile } = useProfileData();

  return (
    <main className="bg-background">
      <div className="max-w-5xl mx-auto p-4 flex gap-3">
        <Card className="mb-auto w-xl bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
          <CardHeader className="flex flex-row items-center gap-2">
            <Avatar className="size-10">
              {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} />}
              <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <CardTitle>{profile?.displayName}</CardTitle>
              <CardDescription>
                {profile?.username}@{profile?.domain}
              </CardDescription>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <PencilIcon className="size-4 mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>
              <EditProfileDialog />
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <UserIcon className="size-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <EditProfileDialog />
            </Dialog>
          </CardContent>
        </Card>
        <ScrollArea className="h-[calc(100vh-6rem)] border-primary/50 border-l pl-3">
          <HomeFeedView />
        </ScrollArea>
      </div>
    </main>
  );
}
