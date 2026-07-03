import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, SearchIcon } from "lucide-react";
import { searchRemoteUser } from "../api";
import { useState } from "react";
import { TimelineActor } from "@/features/timeline/api";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUnfollowRemoteUser } from "@/features/profile/hooks/useFollowing";

const handleRegex = /^@?([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

const DiscoverDialog = () => {
  const [handle, setHandle] = useState("");

  const { mutate: unfollowRemoteUser, isPending: isUnfollowing } =
    useUnfollowRemoteUser();

  const handleUnfollow = (actorUri: string) => {
    unfollowRemoteUser(actorUri);
  };

  const {
    mutate: search,
    data: user,
    isPending,
    reset,
  } = useMutation<TimelineActor, Error, string>({
    mutationFn: (handle) => searchRemoteUser(handle),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    },
  });

  const handleSearch = () => {
    if (!handleRegex.test(handle.trim())) {
      toast.error("Invalid handle");
      return;
    }

    reset();
    search(handle.trim());
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SearchIcon className="size-4" />
          Search
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search for a user to follow</DialogTitle>
        </DialogHeader>

        <ButtonGroup className="w-full">
          <Input
            placeholder="user@domain.com"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />
          <Button
            variant="outline"
            aria-label="Search"
            onClick={handleSearch}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SearchIcon className="size-4" />
            )}
            Search
          </Button>
        </ButtonGroup>

        {user && (
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarImage
                  src={user.avatarUrl ?? ""}
                  alt={user.displayName || user.username}
                />
                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.displayName || user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{user.username}
                  {user.domain ? `@${user.domain}` : ""}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              disabled={isUnfollowing}
              onClick={() => handleUnfollow(user.actorUri ?? "")}
            >
              {isUnfollowing ? "Unfollowing..." : "Unfollow"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DiscoverDialog;
