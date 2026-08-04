import { ArrowLeft, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FollowerSkeleton } from "./FollowerSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowRequestData } from "../api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const FollowRequestsPage = ({
  data,
  totalCount,
  isLoading,
  isError,
  isFetchingNextPage,
  onApproveRequest,
  isApprovingRequest,
  approvingRequestId,
  ref,
}: {
  data: FollowRequestData[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  onApproveRequest: (requestId: string) => void;
  isApprovingRequest: boolean;
  approvingRequestId?: string;
  ref: React.RefObject<HTMLDivElement>;
}) => {
  const router = useRouter();

  const handleApproveRequest = (requestId: string) => {
    onApproveRequest(requestId);
  };

  return (
    <main className="container mx-auto max-w-xl px-4 py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="size-4" />
        Back
      </Button>
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="size-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Follow Requests</h1>
        {!isLoading && (
          <span className="text-sm text-muted-foreground ml-auto">
            {totalCount}{" "}
            {totalCount === 1 ? "request" : "requests"}
          </span>
        )}
      </div>

      <Separator className="mb-4" />

      {isError && (
        <p className="text-sm text-destructive text-center py-8">
          Failed to load follow requests. Please try again.
        </p>
      )}

      {isLoading ? (
        <div>
          {Array.from({ length: 6 }).map((_, i) => (
            <FollowerSkeleton key={i} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No pending follow requests.
        </p>
      ) : (
        <ul>
          {data.map((item) => {
            const initials = (item.actor.displayName || item.actor.username)
              .slice(0, 2)
              .toUpperCase();

            return (
              <li key={item.id}>
                <div className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      <AvatarImage
                        src={item.actor.avatarUrl}
                        alt={item.actor.displayName || item.actor.username}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.actor.displayName || item.actor.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{item.actor.username}
                        {item.actor.domain ? `@${item.actor.domain}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      disabled={isApprovingRequest}
                      onClick={() => handleApproveRequest(item.id)}
                    >
                      {isApprovingRequest && approvingRequestId === item.id
                        ? "Approving..."
                        : "Accept"}
                    </Button>
                    {/* todo: reject request */}
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
  );
};

export default FollowRequestsPage;