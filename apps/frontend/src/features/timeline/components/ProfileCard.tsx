"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import ProfileStat from "./ProfileStat";
import { ProfileData } from "@/features/profile/api";

export function ProfileCard({ profile }: { profile: ProfileData }) {
  return (
    <Card className="w-md max-md:mx-auto max-md:w-full mb-auto bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
      <CardContent className="p-3 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-3 max-md:space-y-2">
            <div className="p-0.5 rounded-full bg-linear-to-br from-primary/70 via-accent-foreground/10 to-primary/30 shadow-md">
            <Avatar className="size-28 border-2 border-card max-md:size-20">
              {profile?.avatarUrl && (
                <AvatarImage src={profile.avatarUrl} alt={profile.username} />
              )}
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {profile?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center space-y-1 w-full">
            <p className="font-bold text-lg tracking-tight">
              {profile?.displayName}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              @{profile?.username}@{profile?.domain}
            </p>
          </div>
        </div>

        {/* Bio */}
        {profile?.summary && (
          <p className="text-sm text-foreground/70 leading-relaxed italic border-l-2 border-primary/30 pl-3 text-left">
            {profile.summary}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x items-center text-center border-t border-border/60 pt-4">
          <ProfileStat text="Posts" value={profile?.postsCount} left />

          <ProfileStat text="Followers" value={profile?.followersCount} />

          <ProfileStat text="Following" value={profile?.followingCount} right />
        </div>
      </CardContent>
    </Card>
  );
}
