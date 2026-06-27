"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProfileStat from "./ProfileStat";

interface Profile {
  banner: string;
  avatar: string;
  displayName: string;
  handle: string;
  domain: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
}

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Card className="w-sm max-md:mx-auto max-md:w-full mb-auto bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
      <CardContent className="p-3 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-3">
          <div className="p-0.5 rounded-full bg-linear-to-br from-primary/70 via-accent-foreground/10 to-primary/30 shadow-md">
            <Avatar className="size-28 border-2 border-card">
              <AvatarImage src={profile.avatar} alt={profile.displayName} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {profile.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center space-y-1 w-full">
            <p className="font-bold text-lg tracking-tight">
              {profile.displayName}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {profile.handle}@{profile.domain}
            </p>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-foreground/70 leading-relaxed italic border-l-2 border-primary/30 pl-3 text-left">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x items-center text-center border-t border-border/60 pt-4">
          <ProfileStat text="Posts" value={profile.postsCount} left />

          <ProfileStat text="Followers" value={profile.followers} />

          <ProfileStat text="Following" value={profile.following} right />
        </div>
      </CardContent>
    </Card>
  );
}
