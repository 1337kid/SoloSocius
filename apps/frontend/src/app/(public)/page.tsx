"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { PublicColumn, PublicFrame } from "@/components/ui/shell";
import { Spinner } from "@/components/ui/spinner";
import { ProfileData } from "@/features/profile/api";
import { useProfileData } from "@/features/profile/hooks/useProfileData";
import { ProfileCard } from "@/features/timeline/components/ProfileCard";
import { PublicTimelineView } from "@/features/timeline/components/PublicTimelineView";
import { ApiError } from "@/lib/api/axios";
import { routes } from "@/lib/routes";

export default function PublicTimeline() {
  const { data: profile, error, isLoading } = useProfileData();

  if (isLoading) {
    return (
      <PublicFrame>
        <div data-slot="center-state">
          <Spinner />
        </div>
      </PublicFrame>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <PublicFrame>
        <div data-slot="center-state">
          <h1>No account set up yet</h1>
          <p data-slot="post-handle">Get started by setting up your profile.</p>
          <Button asChild>
            <Link href={routes.setup}>Setup</Link>
          </Button>
        </div>
      </PublicFrame>
    );
  }

  if (error) {
    return (
      <PublicFrame>
        <div data-slot="center-state">
          <p>{error.message}</p>
        </div>
      </PublicFrame>
    );
  }

  return (
    <PublicFrame>
      <Navbar />
      <PublicColumn>
        <ProfileCard profile={profile as ProfileData} />
        <PublicTimelineView />
      </PublicColumn>
    </PublicFrame>
  );
}
