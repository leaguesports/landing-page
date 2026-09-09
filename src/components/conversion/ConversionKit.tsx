"use client";

import { CoverageNotify } from "@/components/conversion/CoverageNotify";
import { CtaPair, type CtaPairTone } from "@/components/conversion/CtaPair";
import { StickyCtaBar } from "@/components/conversion/StickyCtaBar";
import type { CtaSlot, PageType } from "@/lib/analytics/track";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";

export function ConversionKit({
  matrix,
  tone = "play",
  sport,
  sportName,
  city,
  cityName,
  slug,
  sourcePage,
  pageKey,
  showSticky = true,
  showFallback = false,
  stickyOffsetClassName = "",
  pageType,
  slot = "hero",
}: {
  matrix: CtaMatrix;
  tone?: CtaPairTone;
  sport?: string | null;
  sportName?: string | null;
  city?: string | null;
  cityName?: string | null;
  slug?: string | null;
  sourcePage?: string | null;
  pageKey: string;
  showSticky?: boolean;
  showFallback?: boolean;
  stickyOffsetClassName?: string;
  pageType: PageType;
  slot?: CtaSlot;
}) {
  const fallbackRoadmap = matrix.fallback === "notify_roadmap";
  const showNotify =
    showFallback &&
    (matrix.fallback === "notify" || matrix.fallback === "notify_roadmap");

  return (
    <>
      <CtaPair
        matrix={matrix}
        slot={slot}
        tone={tone}
        sport={sport}
        city={city}
        slug={slug}
      />
      {showNotify ? (
        <div className="mt-6 max-w-xl">
          <CoverageNotify
            sport={sport}
            sportName={sportName}
            city={city}
            cityName={cityName}
            sourcePage={sourcePage}
            pageType={pageType}
            showRoadmap={fallbackRoadmap}
          />
        </div>
      ) : null}
      {showSticky ? (
        <StickyCtaBar
          matrix={matrix}
          tone={tone}
          sport={sport}
          city={city}
          slug={slug}
          pageKey={pageKey}
          offsetClassName={stickyOffsetClassName}
        />
      ) : null}
    </>
  );
}
