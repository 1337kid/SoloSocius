"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

function isInteractiveClick(event: React.MouseEvent) {
  if (event.defaultPrevented) return true;
  if (event.button !== 0) return true;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return true;
  }
  if (!(event.target instanceof Element)) return true;
  if (
    event.target.closest(
      "a, button, input, textarea, select, [role='menuitem']",
    )
  ) {
    return true;
  }
  if (event.target.closest("[data-slot='post-actions']")) return true;
  if (window.getSelection()?.toString()) return true;
  return false;
}

function Status({
  name,
  handle,
  time,
  avatarUrl,
  html,
  href,
  profileHref,
  media,
  boost,
  context,
  actions,
  variant,
}: {
  name: string;
  handle: string;
  time: string;
  avatarUrl?: string | null;
  html: string;
  href?: string;
  profileHref?: string;
  media?: React.ReactNode;
  boost?: React.ReactNode;
  context?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "detail";
}) {
  const router = useRouter();
  const isDetail = variant === "detail";
  const isInteractive = Boolean(href) && !isDetail;

  const avatar = (
    <Avatar size="lg">
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
      <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );

  const nameEl = profileHref ? (
    <Link href={profileHref} data-slot="post-name">
      {name}
    </Link>
  ) : (
    <p data-slot="post-name">{name}</p>
  );

  return (
    <article
      data-slot="post"
      data-variant={variant}
      data-interactive={isInteractive || undefined}
      onClick={(event) => {
        if (!isInteractive || !href || isInteractiveClick(event)) return;
        router.push(href);
      }}
    >
      {boost}
      <div data-slot="post-top">
        {profileHref ? (
          <Link href={profileHref} data-slot="post-avatar">
            {avatar}
          </Link>
        ) : (
          avatar
        )}
        <div data-slot="post-main">
          <div data-slot="post-meta">
            {nameEl}
            <p data-slot="post-handle">{handle}</p>
            {href ? (
              <Link href={href} data-slot="post-time">
                <time>{time}</time>
              </Link>
            ) : (
              <time data-slot="post-time">{time}</time>
            )}
          </div>
          {context}
          <div data-slot="post-body" dangerouslySetInnerHTML={{ __html: html }} />
          {media}
          {actions}
        </div>
      </div>
    </article>
  );
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
  );
}

export { Status, StatusSkeleton };
