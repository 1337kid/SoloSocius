"use client";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { useProfileData } from "@/features/profile/hooks/useProfile";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PencilIcon, UserIcon } from "lucide-react";
import { EditProfileDialog } from "./EditProfileDialog";

const ProfileCard = () => {
  const { data: profile } = useProfileData();
  return (
    <Card className="mb-auto min-w-3/12 bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
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
  );
};

export default ProfileCard;
