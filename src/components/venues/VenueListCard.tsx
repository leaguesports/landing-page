import { ConversionCtaLink } from "@/components/conversion/CtaPair";
import type { PageType } from "@/lib/analytics/track";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

/**
 * Text-first venue row shared by the Joburg guide and `/watch/{sport}/{city}`.
 *
 * `guide` keeps the hook, More accordion, and h2 from GuideVenueCard.
 * `watch-hub` is the compact hub card: suburb from the venue address, one meta
 * line, filled Open venue. No accordion and no suburb-from-heading.
 *
 * Thumb stays 56px. A later hero_image fills that slot; it does not become a hero panel.
 */
export function VenueListCard({
  variant,
  name,
  suburb,
  slug,
  initial,
  photoSrc,
  hook,
  blurb = [],
  bestFor,
  anchorId,
  meta,
  matrix,
  sport,
  city,
  pageSlug,
  pageType,
}: {
  variant: "guide" | "watch-hub";
  name: string;
  suburb: string;
  slug: string | null;
  initial: string;
  photoSrc?: string | null;
  hook?: string;
  blurb?: string[];
  bestFor?: string | null;
  anchorId?: string | null;
  meta?: string | null;
  matrix: CtaMatrix;
  sport: string | null;
  city: string | null;
  pageSlug: string;
  pageType: Extract<PageType, "guide" | "watch_city_sport">;
}) {
  const hasMore = variant === "guide" && (blurb.length > 0 || Boolean(bestFor));
  const headingClass =
    variant === "guide"
      ? "font-display text-xl leading-none tracking-wide text-white sm:text-2xl"
      : "font-display text-lg leading-tight tracking-wide text-white sm:text-xl";

  return (
    <article
      id={anchorId ?? undefined}
      className={
        variant === "guide"
          ? "scroll-mt-28 rounded-2xl border border-white/8 bg-[#141814] p-4 sm:p-5"
          : "rounded-2xl border border-white/8 bg-[#141814] p-3 sm:p-3.5"
      }
      data-venue-list-card={variant}
      data-guide-venue-card={variant === "guide" ? (slug ?? "") : undefined}
      data-watch-venue-card={variant === "watch-hub" ? (slug ?? "") : undefined}
    >
      <div className="flex items-start gap-3">
        <VenueListMark initial={initial} src={photoSrc} />
        <div className="min-w-0 flex-1">
          {suburb ? (
            <p className="mb-1.5 max-w-full">
              <span className="inline-block max-w-full truncate rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                {suburb}
              </span>
            </p>
          ) : null}
          {variant === "guide" ? (
            <h2 className={headingClass}>{name}</h2>
          ) : (
            <h3 className={headingClass}>{name}</h3>
          )}
          {variant === "watch-hub" && meta ? (
            <p className="mt-1 truncate text-xs leading-relaxed text-zinc-400">
              {meta}
            </p>
          ) : null}
        </div>
      </div>
      {variant === "guide" && hook ? (
        <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
          {hook}
        </p>
      ) : null}
      {slug ? (
        <div
          className={variant === "guide" ? "mt-4" : "mt-3"}
          data-cta-slot="inline"
          data-page-type={pageType}
        >
          <ConversionCtaLink
            cta={{
              id: "open_venue",
              label: "Open venue →",
              href: `/venues/${slug}`,
            }}
            matrix={matrix}
            slot="inline"
            tone="watch"
            variant="primary"
            sport={sport}
            city={city}
            slug={pageSlug}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white"
          />
        </div>
      ) : null}
      {hasMore ? (
        <details className="group mt-3 border-t border-white/8 pt-2">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-zinc-300 marker:content-none [&::-webkit-details-marker]:hidden">
            More
            <ChevronDown
              className="h-4 w-4 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-400">
            {blurb.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {bestFor ? (
              <p>
                <span className="font-semibold text-white">Best for: </span>
                {bestFor}
              </p>
            ) : null}
          </div>
        </details>
      ) : null}
    </article>
  );
}

function VenueListMark({ initial, src }: { initial: string; src?: string | null }) {
  const photo = src?.trim() ?? "";
  if (photo) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
        <Image src={photo} alt="" fill sizes="56px" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className="guide-venue-mark flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10"
      aria-hidden
    >
      <span className="font-display text-lg leading-none tracking-wide text-white/75">
        {initial}
      </span>
    </div>
  );
}
