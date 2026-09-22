import { ConversionCtaLink } from "@/components/conversion/CtaPair";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import type { GuideVenueCardEntry } from "@/lib/guides/venueCards";
import {
  guideVenueCardVisual,
  type GuideVenueMedia,
} from "@/lib/guides/venueMedia";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

function GuideVenueMark({ initial, src }: { initial: string; src?: string }) {
  if (src) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
        <Image
          src={src}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
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

export function GuideVenueCard({
  venue,
  media,
  sport,
  matrix,
  pageSlug,
}: {
  venue: GuideVenueCardEntry;
  media: GuideVenueMedia | null;
  sport: string | null;
  matrix: CtaMatrix;
  pageSlug: string;
}) {
  const suburb = venue.suburb || media?.suburb || "";
  const visual = guideVenueCardVisual({
    name: venue.name,
    suburb,
    media,
  });
  const blurb = venue.blurb
    .split(/\n\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  const hasMore = blurb.length > 0 || Boolean(venue.bestFor);

  return (
    <article
      id={venue.anchorId ?? undefined}
      className="scroll-mt-28 rounded-2xl border border-white/8 bg-[#141814] p-4 sm:p-5"
      data-guide-venue-card={venue.slug ?? ""}
    >
      <div className="flex items-start gap-3">
        <GuideVenueMark
          initial={visual.initial}
          src={visual.kind === "photo" ? visual.src : undefined}
        />
        <div className="min-w-0 flex-1">
          {suburb ? (
            <p className="mb-1.5">
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                {suburb}
              </span>
            </p>
          ) : null}
          <h2 className="font-display text-xl leading-none tracking-wide text-white sm:text-2xl">
            {venue.name}
          </h2>
        </div>
      </div>
      {venue.hook ? (
        <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
          {venue.hook}
        </p>
      ) : null}
      {venue.slug ? (
        <div className="mt-4" data-cta-slot="inline">
          <ConversionCtaLink
            cta={{
              id: "open_venue",
              label: "Open venue →",
              href: `/venues/${venue.slug}`,
            }}
            matrix={matrix}
            slot="inline"
            tone="watch"
            variant="primary"
            sport={sport}
            city={suburb || null}
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
            {venue.bestFor ? (
              <p>
                <span className="font-semibold text-white">Best for: </span>
                {venue.bestFor}
              </p>
            ) : null}
          </div>
        </details>
      ) : null}
    </article>
  );
}
