"use client";

import { useAuth } from "@/hooks/useAuth";
import { communityChallengeHref } from "@/lib/communities/communities";
import Link from "next/link";

type CommunityChallengeLinkProps = {
  communityId: string;
  guestName?: string | null;
  /** Hide the CTA when this id is the signed-in user (don't challenge yourself). */
  hideForUserId?: string | null;
  children?: string;
  className?: string;
};

export function CommunityChallengeLink({
  communityId,
  guestName,
  hideForUserId,
  children = "Challenge",
  className = "inline-flex min-h-11 items-center text-sm font-medium text-emerald-300 hover:text-emerald-200",
}: CommunityChallengeLinkProps) {
  const { user } = useAuth();
  if (hideForUserId && user?.id && user.id === hideForUserId) {
    return null;
  }

  return (
    <Link
      href={communityChallengeHref({ communityId, guestName })}
      className={className}
    >
      {children}
    </Link>
  );
}
