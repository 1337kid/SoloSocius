"use client";
import { ProfileCard } from "@/features/timeline/components/ProfileCard";
import { PublicTimelineView } from "@/features/timeline/components/PublicTimelineView";
import Navbar from "@/components/Navbar";

import { useProfileData } from "@/features/profile/hooks/useProfile";
import { ProfileData } from "@/features/profile/api";

export default function PublicTimeline() {
  const { data: profile } = useProfileData();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="relative max-w-5xl mx-auto">
        {/* Banner */}
        <div className="relative mx-4 h-52 overflow-hidden rounded-2xl shadow-md py-2">
          {profile?.bannerUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.bannerUrl}
                alt="Profile banner"
                className="relative w-full h-full object-cover rounded-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </>
          )}
        </div>

        <div className="flex gap-3 px-4 py-1 max-md:flex-col">
          <ProfileCard profile={profile as ProfileData} />
          <PublicTimelineView />
        </div>
      </div>
    </main>
  );
}
