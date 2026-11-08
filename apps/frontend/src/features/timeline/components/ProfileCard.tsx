"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileData } from "@/features/profile/api"
import { routes } from "@/lib/routes"

import ProfileStat from "./ProfileStat"

export function ProfileCard({ profile }: { profile: ProfileData }) {
  const name = profile.displayName || profile.username

  return (
    <header data-slot="profile-header">
      <div data-slot="profile-banner">
        {profile.bannerUrl ? (
          <img src={profile.bannerUrl} alt="" />
        ) : null}
      </div>
      <div data-slot="profile-body">
        <Avatar size="xl">
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={name} />
          ) : null}
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 data-slot="profile-name">{profile.displayName}</h1>
        <p data-slot="post-handle">
          @{profile.username}@{profile.domain}
        </p>
        {profile.summary ? (
          <p data-slot="profile-bio">{profile.summary}</p>
        ) : null}
        <div data-slot="stat-row">
          <ProfileStat text="Posts" value={profile.postsCount} />
          <ProfileStat
            text="Followers"
            value={profile.followersCount}
            href={routes.followers}
          />
          <ProfileStat
            text="Following"
            value={profile.followingCount}
            href={routes.following}
          />
        </div>
      </div>
    </header>
  )
}
