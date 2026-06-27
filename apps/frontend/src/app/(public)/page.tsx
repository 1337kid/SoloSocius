"use client";
import { ProfileCard } from "@/features/timeline/components/ProfileCard";
import { PublicTimelineView } from "@/features/timeline/components/PublicTimelineView";

export default function PublicTimeline() {
  const profile = {
    banner:
      "",
    avatar:
      "",
    displayName: "Alex Johnson",
    handle: "@alex",
    domain: "solosocius.social",
    bio: "A single-user ActivityPub instance exploring the fediverse.",
    followers: 1234,
    following: 567,
    postsCount: 89,
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="relative mx-4 h-48 bg-primary/10 overflow-hidden rounded-b-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.banner}
            alt="Profile banner"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="flex gap-4 p-4 max-md:flex-col">
          <ProfileCard profile={profile} />
          <PublicTimelineView />
        </div>
      </div>
    </main>
  );
}
