import { ConversionCtaLink } from "@/components/conversion/CtaPair";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import {
  cartoDarkTileUrl,
  tilePixelFraction,
  type GuideVenueCardEntry,
} from "@/lib/guides/venueCards";
import type { GuideVenueMedia } from "@/lib/guides/venueMedia";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

const MEDIA_CLASS = "relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10]";

const SPORT_TINT: Record<string, string> = {
  rugby: "from-[#2d6a2d] via-emerald-950 to-[#101610]",
  soccer: "from-[#1a6fb5] via-slate-950 to-[#10141a]",
  cricket: "from-[#8a7030] via-yellow-950 to-[#14140c]",
  tennis: "from-lime-800 via-emerald-950 to-[#101610]",
  padel: "from-emerald-800 via-emerald-950 to-[#101610]",
  golf: "from-lime-800 via-emerald-950 to-[#101610]",
  darts: "from-amber-800 via-stone-950 to-[#141210]",
};

function sportTint(sport: string | null): string {
  if (sport && sport in SPORT_TINT) return SPORT_TINT[sport] ?? SPORT_TINT.rugby;
  return "from-sky-800 via-sky-950 to-[#0c1218]";
}

function suburbInitial(suburb: string): string {
  const initial = suburb.trim().charAt(0).toUpperCase();
  return initial || "•";
}

export function GuideVenueCardSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div
      className="my-10 grid grid-cols-1 gap-6 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading venues"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-white/8 bg-[#141814]"
        >
          <div className={`${MEDIA_CLASS} animate-pulse bg-white/5`} />
          <div className="space-y-3 p-5">
            <div className="h-6 w-24 animate-pulse rounded-full bg-white/5" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-full animate-pulse rounded bg-white/5" />
            <div className="h-11 w-full animate-pulse rounded-full bg-white/10 sm:w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GuideVenueCardMedia({
  name,
  suburb,
  sport,
  media,
}: {
  name: string;
  suburb: string;
  sport: string | null;
  media: GuideVenueMedia | null;
}) {
  if (media?.photoUrl) {
    return (
      <div className={MEDIA_CLASS}>
        <Image
          src={media.photoUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  if (media?.latitude != null && media.longitude != null) {
    const fraction = tilePixelFraction(media.latitude, media.longitude);
    return (
      <div className={`${MEDIA_CLASS} bg-[#1c241c]`}>
        {/* CARTO tile is allowed by CSP. next/image does not proxy this map host. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cartoDarkTileUrl(media.latitude, media.longitude)}
          alt=""
          className="h-full w-full object-cover"
        />
        <span
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0c0f0c] bg-emerald-400"
          style={{ left: `${fraction.x * 100}%`, top: `${fraction.y * 100}%` }}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className={`${MEDIA_CLASS} flex items-center justify-center bg-linear-to-br ${sportTint(sport)}`}
    >
      <span className="font-display text-6xl tracking-wide text-white/90" aria-hidden>
        {suburbInitial(suburb || name)}
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
  const blurb = venue.blurb
    .split(/\n\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  const hasMore = blurb.length > 0 || Boolean(venue.bestFor);

  return (
    <article
      id={venue.anchorId ?? undefined}
      className="scroll-mt-28 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]"
      data-guide-venue-card={venue.slug ?? ""}
    >
      <GuideVenueCardMedia
        name={venue.name}
        suburb={suburb}
        sport={sport}
        media={media}
      />
      <div className="flex flex-col p-5">
        {suburb ? (
          <p className="mb-3">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300">
              {suburb}
            </span>
          </p>
        ) : null}
        <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
          {venue.name}
        </h2>
        {venue.hook ? (
          <p className="mt-3 text-base leading-relaxed text-zinc-300">{venue.hook}</p>
        ) : null}
        {venue.slug ? (
          <div className="mt-5">
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
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white sm:w-auto"
            />
          </div>
        ) : null}
        {hasMore ? (
          <details className="group mt-5 border-t border-white/8 pt-3">
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
      </div>
    </article>
  );
}
