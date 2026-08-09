"use client";

import { useState } from "react";
import { Heart, Repeat, Reply } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import PostStat from "./PostStat";
import ShowMoreActions from "./ShowMoreActions";
import { PostComposer } from "@/features/home/components/PostComposer";
import { useInteraction } from "../hooks/useInteraction";
import { useProfileData } from "@/features/profile/hooks/useProfileData";

interface PostActionsProps {
  postId: string;
  postUri: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialBoosted: boolean;
  initialBoostCount: number;
  actorDomain: string;
  postContent: string;
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
}: PostActionsProps) {
  const { interactWithPost, undoInteractWithPost } = useInteraction();
  const { data: profileData } = useProfileData();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [boosted, setBoosted] = useState(initialBoosted);
  const [boostCount, setBoostCount] = useState(initialBoostCount);

  const handleBoostInteraction = async () => {
    const wasBoosted = boosted;

    setBoosted(!wasBoosted);
    setBoostCount((c) => c + (wasBoosted ? -1 : 1));

    try {
      if (wasBoosted) {
        await undoInteractWithPost.mutateAsync({
          targetPostUri: postUri,
          type: "boost",
        });
      } else {
        await interactWithPost.mutateAsync({
          targetPostUri: postUri,
          type: "boost",
        });
      }
    } catch {
      setBoosted(wasBoosted);
      setBoostCount((c) => c + (wasBoosted ? 1 : -1));
    }
  };

  const handleLikeInteraction = async () => {
    const wasLiked = liked;

    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));

    try {
      if (wasLiked) {
        await undoInteractWithPost.mutateAsync({
          targetPostUri: postUri,
          type: "like",
        });
      } else {
        await interactWithPost.mutateAsync({
          targetPostUri: postUri,
          type: "like",
        });
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground text-xs"
              >
                <Reply className="size-4 text-primary" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Reply</TooltipContent>
        </Tooltip>
        <PopoverContent align="start" className="w-80 p-3">
          <PostComposer inReplyTo={postUri} variant="inline" />
        </PopoverContent>
      </Popover>
      <PostStat
        count={boostCount}
        active={boosted}
        icon={<Repeat className="size-4 text-primary" />}
        onClick={handleBoostInteraction}
        label="Boost"
      />
      <PostStat
        count={likeCount}
        active={liked}
        icon={
          <Heart
            className={`size-4 text-primary ${liked ? "fill-primary" : ""}`}
          />
        }
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
  );
}
