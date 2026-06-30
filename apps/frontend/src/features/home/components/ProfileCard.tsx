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
import { Edit, PencilIcon, SearchIcon, UserIcon, UserPlus } from "lucide-react";
import { EditProfileDialog } from "./EditProfileDialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ButtonGroup } from "@/components/ui/button-group";

const ProfileCard = () => {
  const { data: profile } = useProfileData();
  return (
    <div className="flex flex-col gap-4">
      <Card className="mb-auto min-w-3/12 bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
        <CardHeader className="flex flex-row items-center gap-2">
          <Avatar className="size-16">
            {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} />}
            <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle>{profile?.displayName}</CardTitle>
            <CardDescription>
              {profile?.username}@{profile?.domain}
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="ml-auto">
                <Edit className="size-4" />
              </Button>
            </DialogTrigger>
            <EditProfileDialog />
          </Dialog>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-2">
          <div className="flex gap-2 justify-evenly">
            <p className="flex flex-col items-center gap-1 text-muted-foreground">
              {profile?.postsCount} <span className="text-primary">posts</span>
            </p>
            <p className="flex flex-col items-center gap-1 text-muted-foreground">
              {profile?.followersCount}{" "}
              <span className="text-primary">followers</span>
            </p>
            <p className="flex flex-col items-center gap-1 text-muted-foreground">
              {profile?.followingCount}{" "}
              <span className="text-primary">following</span>
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-auto min-w-3/12 bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle>Discover People</CardTitle>
          <CardDescription>Find new people to follow</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <ButtonGroup className="w-full">
            <Input placeholder="Search for a user" />
            <Button variant="outline" aria-label="Search">
              <SearchIcon />
            </Button>
          </ButtonGroup>
        </CardContent>
      </Card>
      <Card className="mb-auto min-w-3/12 bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
        <CardContent>
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="What's on your mind?"
              className="w-full"
              rows={5}
            />
            <Button className="w-full">
              <PencilIcon className="size-4 mr-2" />
              Create Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCard;
