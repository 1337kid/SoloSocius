"use client"

import { useState } from "react"
import { Heart, Repeat, Reply } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PostComposer } from "@/features/home/components/PostComposer"
import { useProfileData } from "@/features/profile/hooks/useProfileData"

import { useInteraction } from "../hooks/useInteraction"
import PostStat from "./PostStat"
import ShowMoreActions from "./ShowMoreActions"

interface PostActionsProps {
  postId: string
  postUri: string
  initialLiked: boolean
  initialLikeCount: number
  initialBoosted: boolean
  initialBoostCount: number
  actorDomain: string
  postContent: string
  onInteract?: () => void
}

export function PostActions({
  postId,
  postUri,
  initialLiked,
  initialLikeCount,
  initialBoosted,
  initialBoostCount,
  actorDomain,
  postContent,
  onInteract,
}: PostActionsProps) {
  const { interactWithPost, undoInteractWithPost } = useInteraction()
  const { data: profileData } = useProfileData()
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [boosted, setBoosted] = useState(initialBoosted)
  const [boostCount, setBoostCount] = useState(initialBoostCount)

  const handleBoostInteraction = async () => {
    onInteract?.()
    const wasBoosted = boosted
    setBoosted(!wasBoosted)
    setBoostCount((c) => c + (wasBoosted ? -1 : 1))

    try {
      if (wasBoosted) {
        await undoInteractWithPost.mutateAsync({
          targetPostUri: postUri,
          type: "boost",
        })
      } else {
        await interactWithPost.mutateAsync({
          targetPostUri: postUri,
          type: "boost",
        })
      }
    } catch {
      setBoosted(wasBoosted)
      setBoostCount((c) => c + (wasBoosted ? 1 : -1))
    }
  }

  const handleLikeInteraction = async () => {
    onInteract?.()
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((c) => c + (wasLiked ? -1 : 1))

    try {
      if (wasLiked) {
        await undoInteractWithPost.mutateAsync({
          targetPostUri: postUri,
          type: "like",
        })
      } else {
        await interactWithPost.mutateAsync({
          targetPostUri: postUri,
          type: "like",
        })
      }
    } catch {
      setLiked(wasLiked)
      setLikeCount((c) => c + (wasLiked ? 1 : -1))
    }
  }

  return (
    <div data-slot="post-actions">
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="action" size="sm" aria-label="Reply">
                <Reply />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Reply</TooltipContent>
        </Tooltip>
        <PopoverContent align="start" size="reply">
          <PostComposer inReplyTo={postUri} variant="inline" />
        </PopoverContent>
      </Popover>
      <PostStat
        count={boostCount}
        active={boosted}
        icon={<Repeat />}
        onClick={handleBoostInteraction}
        label="Boost"
      />
      <PostStat
        count={likeCount}
        active={liked}
        icon={<Heart />}
        onClick={handleLikeInteraction}
        label="Like"
      />
      <ShowMoreActions
        id={postId}
        postUri={postUri}
        isLocal={actorDomain === profileData?.domain}
        postContent={postContent}
      />
    </div>
  )
}
