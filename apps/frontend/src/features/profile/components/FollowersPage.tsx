"use client"

import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ColumnHeader } from "@/components/ui/shell"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { ArrowLeft } from "lucide-react"

import { FollowersData } from "../api"
import { useFollowRequests } from "../hooks/useFollowRequests"
import { useUnfollowRemoteUser } from "../hooks/useUnfollowRemoteUser"
import { FollowerSkeleton } from "./FollowerSkeleton"

const FollowersPage = ({
  data,
  totalCount,
  type,
  isLoading,
  isError,
  isFetchingNextPage,
  ref,
}: {
  data: FollowersData[]
  totalCount: number
  type: string
  isLoading: boolean
  isError: boolean
  isFetchingNextPage: boolean
  ref: React.RefObject<HTMLDivElement>
}) => {
  const router = useRouter()
  const auth = useAuth()
  const {
    mutate: unfollowRemoteUser,
    isPending: isUnfollowing,
    variables,
  } = useUnfollowRemoteUser()
  const { rejectRequest, isRejectingRequest, rejectingRequestId } =
    useFollowRequests()

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
          <h1>{type}</h1>
          {!isLoading ? <p>{totalCount}</p> : null}
        </div>
      </ColumnHeader>

      {isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Could not load {type.toLowerCase()}</EmptyTitle>
            <EmptyDescription>Please try again.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : isLoading ? (
        <div data-slot="person-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <FollowerSkeleton key={i} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No {type.toLowerCase()} yet</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul data-slot="person-list">
          {data.map((item) => {
            const name = item.actor.displayName || item.actor.username
            const initials = name.slice(0, 2).toUpperCase()
            return (
              <li key={item.id} data-slot="person">
                <div data-slot="person-id">
                  <Avatar size="lg">
                    <AvatarImage src={item.actor.avatarUrl ?? undefined} alt={name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p data-slot="post-name">{name}</p>
                    <p data-slot="post-handle">
                      @{item.actor.username}
                      {item.actor.domain ? `@${item.actor.domain}` : ""}
                    </p>
                  </div>
                </div>
                {auth.data?.username && type === "Follower" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isRejectingRequest}
                    onClick={() => rejectRequest(item.id)}
                  >
                    {isRejectingRequest && rejectingRequestId === item.id ? (
                      <Spinner data-icon="inline-start" />
                    ) : null}
                    Remove
                  </Button>
                ) : null}
                {auth.data?.username && type === "Following" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUnfollowing}
                    onClick={() => unfollowRemoteUser(item.actor.actorUri)}
                  >
                    {isUnfollowing && variables === item.actor.actorUri ? (
                      <Spinner data-icon="inline-start" />
                    ) : null}
                    Unfollow
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      <div ref={ref} data-slot="feed-sentinel">
        {isFetchingNextPage ? <Spinner /> : null}
      </div>
    </>
  )
}

export default FollowersPage
