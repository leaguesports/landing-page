import { ConversionCtaLink } from "@/components/conversion/CtaPair";
import type { PageType } from "@/lib/analytics/track";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

/**
 * Text-first venue row shared by the Joburg guide and `/watch/{sport}/{city}`.
 *
 * `guide` keeps the hook, More accordion, and h2 from GuideVenueCard.
 * `watch-hub` is the dense Fanzo row: thumb, name, suburb · distance,
 * showing chip, watch cues, one-line hook, filled Open venue.
 * No phone, address, or booking on the row.
 *
 * Thumb stays 56px. A legal hero_image fills that slot; otherwise the quiet
 * initial mark. It does not become a hero panel or a map tile.
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
  placeLine,
  showing,
  cues = [],
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
  hook?: string | null;
  blurb?: string[];
  bestFor?: string | null;
  anchorId?: string | null;
  meta?: string | null;
  /** Suburb · distance. Watch hub only. */
  placeLine?: string | null;
  /** Showing-now chip. Watch hub only. Omitted when null. */
  showing?: string | null;
  /** Watch cues, already capped. Watch hub only. */
  cues?: readonly string[];
  matrix: CtaMatrix;
  sport: string | null;
  city: string | null;
  pageSlug: string;
  pageType: Extract<PageType, "guide" | "watch_city_sport">;
}) {
  if (variant === "watch-hub") {
    const line = placeLine?.trim() || suburb.trim();
    const cueLine = cues.filter(Boolean).slice(0, 4).join(" · ");
    return (
      <article
        className="rounded-2xl border border-white/8 bg-[#141814] p-3 sm:p-3.5"
        data-venue-list-card="watch-hub"
        data-watch-venue-card={slug ?? ""}
        data-suburb={suburb}
      >
        <div className="flex items-start gap-3">
          <VenueListMark initial={initial} src={photoSrc} />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg leading-tight tracking-wide text-white sm:text-xl">
              {name}
            </h3>
            {line ? (
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{line}</p>
            ) : null}
            {showing ? (
              <p className="mt-1.5">
                <span className="inline-block max-w-full truncate rounded-md bg-sky-400/10 px-2 py-0.5 text-[11px] font-medium text-sky-100">
                  {showing}
                </span>
              </p>
            ) : null}
            {cueLine ? (
              <p className="mt-1.5 text-xs text-zinc-400">{cueLine}</p>
            ) : null}
            {hook ? (
              <p className="mt-1.5 text-sm leading-snug text-zinc-300">{hook}</p>
            ) : null}
            {!showing && !cueLine && !hook && meta ? (
              <p className="mt-1 truncate text-xs leading-relaxed text-zinc-400">{meta}</p>
            ) : null}
            {slug ? (
              <div
                className="mt-3"
                data-cta-slot="inline"
                data-cta-id="open_venue"
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
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
                />
              </div>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  const hasMore = blurb.length > 0 || Boolean(bestFor);

  return (
    <article
      id={anchorId ?? undefined}
      className="scroll-mt-28 rounded-2xl border border-white/8 bg-[#141814] p-4 sm:p-5"
      data-venue-list-card="guide"
      data-guide-venue-card={slug ?? ""}
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
          <h2 className="font-display text-xl leading-none tracking-wide text-white sm:text-2xl">
            {name}
          </h2>
        </div>
      </div>
      {hook ? (
        <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">{hook}</p>
      ) : null}
      {slug ? (
        <div
          className="mt-4"
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
