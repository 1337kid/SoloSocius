"use client";

import { useParams } from "next/navigation";

import { RemoteProfileView } from "@/features/profile/components/RemoteProfileView";

export default function UserProfilePage() {
  const params = useParams<{ webfinger: string }>();
  const webfinger = decodeURIComponent(params.webfinger ?? "");

  return <RemoteProfileView webfinger={webfinger} />;
}
