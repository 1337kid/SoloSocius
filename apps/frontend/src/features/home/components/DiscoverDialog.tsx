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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFollowUser } from "../hooks/useFollowUser";

const handleRegex = /^@?([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

interface DiscoverDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DiscoverDialog = ({ open, onOpenChange }: DiscoverDialogProps = {}) => {
  const [handle, setHandle] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { mutate: followUser, isPending: isFollowingUser } = useFollowUser();

  const [user, setUser] = useState<TimelineActor | null>(null);

  const handleSearch = async () => {
    try {
      if (!handle.trim()) return;
      setIsSearching(true);
      const actor = await searchRemoteUser(handle.trim());
      setUser(actor);
      setIsSearching(false);
    } catch (error) {
      toast.error("Error searching for user");
      setIsSearching(false);
    }
  };

  const handleFollow = () => {
    if (!user?.actorUri) {
      toast.error("Invalid handle");
      return;
    }

    followUser(user?.actorUri, {
      onSuccess: () => {
        toast.success("User followed successfully");
        setUser((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: true,
              }
            : prev,
        );
      },
    });
  };

  const handleOpenChange = (openState: boolean) => {
    if (!openState) {
      setHandle("");
      setUser(null);
    }
    onOpenChange?.(openState);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {open === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline">
            <SearchIcon className="size-4" />
            Search
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:min-w-md max-h-[80vh] overflow-y-auto">
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
            disabled={isSearching}
          >
            {isSearching ? (
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
            {user?.isFollowing ? (
              <span>Following</span>
            ) : (
              <Button
                variant="outline"
                disabled={isFollowingUser}
                onClick={handleFollow}
              >
                {isFollowingUser ? "Following..." : "Follow"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DiscoverDialog;
