"use client";

import { Pencil } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EditProfileDialog } from "@/features/profile/components/EditProfileDialog";
import { useProfileData } from "@/features/profile/hooks/useProfileData";
import { routes } from "@/lib/routes";

import { ComposeDialog } from "./ComposeDialog";
import DiscoverDialog from "./DiscoverDialog";
import ProfileStat from "@/features/timeline/components/ProfileStat";

const LeftSidebar = () => {
  const { data: profile } = useProfileData();
  const name = profile?.displayName || profile?.username || "";

  return (
    <>
      <section data-slot="rail-card">
        <div data-slot="profile-identity">
          <Avatar size="lg">
            {profile?.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={name} />
            ) : null}
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p data-slot="post-name">{profile?.displayName}</p>
            <p data-slot="post-handle">
              @{profile?.username}@{profile?.domain}
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Edit profile">
                <Pencil data-icon="inline-start" />
              </Button>
            </DialogTrigger>
            <EditProfileDialog />
          </Dialog>
        </div>
        <div data-slot="stat-row">
          <ProfileStat text="Posts" value={profile?.postsCount ?? 0} />
          <ProfileStat
            text="Followers"
            value={profile?.followersCount ?? 0}
            href={routes.followers}
          />
          <ProfileStat
            text="Following"
            value={profile?.followingCount ?? 0}
            href={routes.following}
          />
        </div>
      </section>
      <section data-slot="rail-card">
        <h2 data-slot="rail-title">Discover</h2>
        <p data-slot="post-handle">Find people to follow</p>
        <DiscoverDialog />
      </section>
      <section data-slot="rail-card">
        <ComposeDialog />
      </section>
    </>
  );
};

export default LeftSidebar;
