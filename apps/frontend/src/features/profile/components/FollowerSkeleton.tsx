import { Skeleton } from "@/components/ui/skeleton"

export const FollowerSkeleton = () => {
  return (
    <div data-slot="person">
      <div data-slot="person-id">
        <Skeleton variant="avatar" />
        <div>
          <Skeleton variant="title" />
          <Skeleton variant="line" />
        </div>
      </div>
    </div>
  )
}
