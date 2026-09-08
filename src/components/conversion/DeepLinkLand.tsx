"use client";

import { track } from "@/lib/analytics/track";
import type { PageType } from "@/lib/analytics/track";
import { useEffect, useRef } from "react";

/**
 * Fires `deep_link_land` once per mount. Client-only so SSR does not
 * double-count the same landing.
 */
export function DeepLinkLand({
  pageType,
  sport,
  slug,
}: {
  pageType: PageType;
  sport?: string | null;
  slug?: string | null;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track("deep_link_land", {
      page_type: pageType,
      sport: sport ?? undefined,
      slug: slug ?? undefined,
    });
  }, [pageType, sport, slug]);

  return null;
}
