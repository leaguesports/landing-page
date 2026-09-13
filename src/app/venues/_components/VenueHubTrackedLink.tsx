"use client";

import { track } from "@/lib/analytics/track";
import Link from "next/link";
import type { ReactNode } from "react";

export function VenueHubTrackedLink({
  href,
  ctaId,
  children,
  className,
  sport,
  city,
  slug,
}: {
  href: string;
  ctaId: string;
  children: ReactNode;
  className?: string;
  sport?: string | null;
  city?: string | null;
  slug?: string | null;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        track("cta_click", {
          page_type: "venue",
          cta_slot: "inline",
          cta_id: ctaId,
          ...(sport ? { sport } : {}),
          ...(city ? { city } : {}),
          ...(slug ? { slug } : {}),
        });
      }}
    >
      {children}
    </Link>
  );
}
