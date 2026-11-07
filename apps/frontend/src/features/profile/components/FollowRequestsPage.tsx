"use client"

import { ArrowLeft } from "lucide-react"
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

import { FollowRequestData } from "../api"
import { FollowerSkeleton } from "./FollowerSkeleton"

const FollowRequestsPage = ({
  data,
  totalCount,
  isLoading,
  isError,
  isFetchingNextPage,
  onApproveRequest,
  isApprovingRequest,
  approvingRequestId,
  onRejectRequest,
  isRejectingRequest,
  rejectingRequestId,
  ref,
}: {
  data: FollowRequestData[]
  totalCount: number
  isLoading: boolean
  isError: boolean
  isFetchingNextPage: boolean
  onApproveRequest: (requestId: string) => void
  isApprovingRequest: boolean
  approvingRequestId?: string
  onRejectRequest: (requestId: string) => void
  isRejectingRequest: boolean
  rejectingRequestId?: string
  ref: React.RefObject<HTMLDivElement>
}) => {
  const router = useRouter()

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
          <h1>Follow requests</h1>
          {!isLoading ? <p>{totalCount}</p> : null}
        </div>
      </ColumnHeader>

      {isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Could not load follow requests</EmptyTitle>
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
            <EmptyTitle>No pending follow requests</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul data-slot="person-list">
          {data.map((item) => {
            const name = item.actor.displayName || item.actor.username
            return (
              <li key={item.id} data-slot="person">
                <div data-slot="person-id">
                  <Avatar size="lg">
                    <AvatarImage src={item.actor.avatarUrl ?? undefined} alt={name} />
                    <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p data-slot="post-name">{name}</p>
                    <p data-slot="post-handle">
                      @{item.actor.username}
                      {item.actor.domain ? `@${item.actor.domain}` : ""}
                    </p>
                  </div>
                </div>
                <div data-slot="person-actions">
                  <Button
                    size="sm"
                    disabled={isApprovingRequest}
                    onClick={() => onApproveRequest(item.id)}
                  >
                    {isApprovingRequest && approvingRequestId === item.id ? (
                      <Spinner data-icon="inline-start" />
                    ) : null}
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isRejectingRequest}
                    onClick={() => onRejectRequest(item.id)}
                  >
                    {isRejectingRequest && rejectingRequestId === item.id
                      ? "Rejecting..."
                      : "Reject"}
                  </Button>
                </div>
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

export default FollowRequestsPage
