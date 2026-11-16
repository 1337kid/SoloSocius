"use client";

import { accountTimelineStream } from "@solosocius/api-types";
import purify from "dompurify";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ColumnHeader } from "@/components/ui/shell";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFollowUser } from "@/features/home/hooks/useFollowUser";
import { FeedTimeline } from "@/features/home/components/FeedTimeline";
import { useTimelineStream } from "@/features/timeline/hooks/useTimelineStream";
import { useUserTimeline } from "@/features/timeline/hooks/useUserTimeline";
import { ProfileStat } from "@/features/timeline/components/ProfileStat";
import { timelineQueryKeys } from "@/features/timeline/keys";
import { ApiError } from "@/lib/api/axios";

import type { ExternalProfile } from "../api";
import { useExternalProfile } from "../hooks/useExternalProfile";
import { useUnfollowRemoteUser } from "../hooks/useUnfollowRemoteUser";
import { isWebfinger } from "../webfinger";

function ProfileFollowAction({ profile }: { profile: ExternalProfile }) {
  const follow = useFollowUser();
  const unfollow = useUnfollowRemoteUser();

  if (profile.isLocal) {
    return <Badge variant="secondary">You</Badge>;
  }

  if (profile.followState === "following") {
    return (
      <Button
        variant="outline"
        disabled={unfollow.isPending}
        onClick={() => unfollow.mutate(profile.actorUri)}
      >
        {unfollow.isPending ? <Spinner data-icon="inline-start" /> : null}
        Unfollow
      </Button>
    );
  }

  if (profile.followState === "requested") {
    return <Badge variant="outline">Requested</Badge>;
  }

  return (
    <Button
      disabled={follow.isPending}
      onClick={() => follow.mutate(profile.actorUri)}
    >
      {follow.isPending ? <Spinner data-icon="inline-start" /> : null}
      {profile.manuallyApprovesFollowers ? "Request" : "Follow"}
    </Button>
  );
}

function RemoteProfileHeader({ profile }: { profile: ExternalProfile }) {
  const name = profile.displayName || profile.username;

  return (
    <header data-slot="profile-header">
      <div data-slot="profile-banner">
        {profile.bannerUrl ? <img src={profile.bannerUrl} alt="" /> : null}
      </div>
      <div data-slot="profile-body">
        <div data-slot="profile-toolbar">
          <Avatar size="xl">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={name} />
            ) : null}
            <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <ProfileFollowAction profile={profile} />
        </div>
        <h1 data-slot="profile-name">{name}</h1>
        <p data-slot="post-handle">{profile.webfinger}</p>
        {profile.manuallyApprovesFollowers ? (
          <p data-slot="post-handle">Approves follow requests</p>
        ) : null}
        {profile.summary ? (
          <div
            data-slot="profile-bio"
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(profile.summary),
            }}
          />
        ) : null}
        <div data-slot="stat-row">
          <ProfileStat text="Posts" value={profile.postsCount} />
        </div>
      </div>
      <Tabs value="posts">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
}

function RemoteProfileTimeline({
  webfinger,
  actorUri,
}: {
  webfinger: string;
  actorUri: string;
}) {
  const query = useUserTimeline(webfinger);
  useTimelineStream(accountTimelineStream(actorUri), timelineQueryKeys.user(webfinger));

  return (
    <FeedTimeline
      query={query}
      emptyTitle="No posts yet"
      emptyDescription="Posts and boosts from this account will show up here"
    />
  );
}

export function RemoteProfileView({ webfinger }: { webfinger: string }) {
  const router = useRouter();
  const valid = isWebfinger(webfinger);
  const profileQuery = useExternalProfile(webfinger, valid);
  const profile = profileQuery.data;
  const name = profile?.displayName || profile?.username;

  return (
    <>
      <ColumnHeader>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1>{name || "Profile"}</h1>
          {profile ? <p>{profile.postsCount} posts</p> : null}
        </div>
      </ColumnHeader>

      {!valid ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>That profile link is not valid</EmptyTitle>
            <EmptyDescription>
              Use a handle like @name@example.com.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : profileQuery.isLoading ? (
        <div data-slot="center-state">
          <Spinner />
        </div>
      ) : profileQuery.error instanceof ApiError &&
        profileQuery.error.status === 404 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Account not found</EmptyTitle>
            <EmptyDescription>
              This server has not seen {webfinger} yet. Search for the handle
              to look them up.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : profileQuery.isError || !profile ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Could not load this profile</EmptyTitle>
            <EmptyDescription>
              {profileQuery.error instanceof Error
                ? profileQuery.error.message
                : "Please try again."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <RemoteProfileHeader profile={profile} />
          <RemoteProfileTimeline
            webfinger={profile.webfinger}
            actorUri={profile.actorUri}
          />
        </>
      )}
    </>
  );
}
