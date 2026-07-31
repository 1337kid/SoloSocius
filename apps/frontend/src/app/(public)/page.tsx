"use client";
import { ProfileCard } from "@/features/timeline/components/ProfileCard";
import { PublicTimelineView } from "@/features/timeline/components/PublicTimelineView";
import Navbar from "@/components/Navbar";
import Link from "next/link";

import { useProfileData } from "@/features/profile/hooks/useProfile";
import { ProfileData } from "@/features/profile/api";
import { ApiError } from "@/lib/api/axios";

export default function PublicTimeline() {
  const { data: profile, error, isLoading } = useProfileData();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">No account set up yet</h1>
        <p className="text-muted-foreground">Get started by setting up your profile.</p>
        <Link
          href="/setup"
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Setup
        </Link>
      </main>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

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
