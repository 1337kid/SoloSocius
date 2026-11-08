import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "avatar" | "line" | "title" | "body"
}) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant}
      className={cn(
        "animate-pulse rounded-md bg-muted",
        variant === "avatar" && "size-11 rounded-full",
        variant === "line" && "h-3 w-28",
        variant === "title" && "h-4 w-36",
        variant === "body" && "h-16 w-full",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
