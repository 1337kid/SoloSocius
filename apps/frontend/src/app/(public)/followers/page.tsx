"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Users } from "lucide-react";

import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useFollowers } from "@/features/profile/hooks/useFollowers";

function FollowerSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

const FollowersPage = () => {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFollowers();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const followers = data?.pages.flatMap((page) => page.followers) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-xl px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Followers</h1>
          {!isLoading && (
            <span className="text-sm text-muted-foreground ml-auto">
              {followers.length} {followers.length === 1 ? "follower" : "followers"}
            </span>
          )}
        </div>

        <Separator className="mb-4" />

        {isError && (
          <p className="text-sm text-destructive text-center py-8">
            Failed to load followers. Please try again.
          </p>
        )}

        {isLoading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <FollowerSkeleton key={i} />
            ))}
          </div>
        ) : followers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No followers yet.
          </p>
        ) : (
          <ul>
            {followers.map((follower) => {
              const initials = (
                follower.actor.displayName || follower.actor.username
              )
                .slice(0, 2)
                .toUpperCase();

              return (
                <li key={follower.id}>
                  <div className="flex items-center gap-3 py-3">
                    <Avatar size="lg">
                      <AvatarImage
                        src={follower.actor.avatarUrl}
                        alt={follower.actor.displayName || follower.actor.username}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {follower.actor.displayName || follower.actor.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{follower.actor.username}
                        {follower.actor.domain ? `@${follower.actor.domain}` : ""}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </li>
              );
            })}
          </ul>
        )}

        <div ref={ref} className="py-4 text-center text-xs text-muted-foreground">
          {isFetchingNextPage && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <FollowerSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FollowersPage;
