"use client";
import { ProfileCard } from "@/features/timeline/components/ProfileCard";
import { PublicTimelineView } from "@/features/timeline/components/PublicTimelineView";

import { useProfileData } from "@/features/profile/hooks/useProfile";
import { ProfileData } from "@/features/profile/api";

export default function PublicTimeline() {
  const { data: profile } = useProfileData();

  return (
    <main className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--color-primary)/6%,transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto">
        {/* Banner */}
        <div className="relative mx-4 h-52 overflow-hidden rounded-b-2xl shadow-md">
          <div className="absolute inset-0 bg-primary" />
          {profile?.bannerUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.bannerUrl}
                alt="Profile banner"
                className="relative w-full h-full object-cover pb-0.5 rounded-b-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </>
          )}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-linear-to-t from-background/60 to-transparent" />
        </div>

        <div className="flex gap-4 p-4 max-md:flex-col">
          <ProfileCard profile={profile as ProfileData} />
          <PublicTimelineView />
        </div>
      </div>
    </main>
  );
}
