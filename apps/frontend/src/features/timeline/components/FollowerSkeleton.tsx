import { Skeleton } from "@/components/ui/skeleton";

export const FollowerSkeleton = () => {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
};
