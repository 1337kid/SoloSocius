import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

function Status({
  name,
  handle,
  time,
  avatarUrl,
  html,
  href,
  media,
  boost,
  context,
  actions,
  variant,
}: {
  name: string
  handle: string
  time: string
  avatarUrl?: string | null
  html: string
  href?: string
  media?: React.ReactNode
  boost?: React.ReactNode
  context?: React.ReactNode
  actions?: React.ReactNode
  variant?: "detail"
}) {
  const body = (
    <div
      data-slot="post-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )

  return (
    <article data-slot="post" data-variant={variant}>
      {boost}
      <div data-slot="post-top">
        <Avatar size={variant === "detail" ? "lg" : "default"}>
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div data-slot="post-main">
          <div data-slot="post-meta">
            <p data-slot="post-name">{name}</p>
            <p data-slot="post-handle">{handle}</p>
            <time data-slot="post-time">{time}</time>
          </div>
          {context}
          {href ? (
            <Link href={href} data-slot="post-link">
              {body}
            </Link>
          ) : (
            body
          )}
          {media}
          {actions}
        </div>
      </div>
    </article>
  )
}

function StatusSkeleton() {
  return (
    <article data-slot="post">
      <div data-slot="post-top">
        <Skeleton variant="avatar" />
        <div data-slot="post-main">
          <Skeleton variant="title" />
          <Skeleton variant="body" />
        </div>
      </div>
    </article>
  )
}

export { Status, StatusSkeleton }
