"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="w-sm max-md:mx-auto max-md:w-full max-h-[400px]">
      <CardContent className="p-6 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="size-32 border-4 border-card ring-2 ring-border">
            <AvatarImage src={profile.avatar} alt={profile.displayName} />
            <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="text-center space-y-1 w-full">
            <p className="font-bold text-lg">{profile.displayName}</p>
            <p className="text-xs text-muted-foreground">
              {profile.handle}@{profile.domain}
            </p>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-center text-foreground/80 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center border-t pt-4">
          <div>
            <p className="font-semibold text-lg">{profile.postsCount}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div>
            <p className="font-semibold text-lg">{profile.followers}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="font-semibold text-lg">{profile.following}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
