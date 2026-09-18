import {
  VenueContactActions,
  VenueUtilityBadges,
} from "@/components/VenueUtilityBadges";
import { ConversionKit } from "@/components/conversion/ConversionKit";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import { isRemoteVenuePhoto } from "@/lib/venues/photo";
import type { VenueDetail } from "@/services/venues";
import { ChevronRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { VenueFollowButton } from "./VenueFollowButton";

function Breadcrumbs({ venue }: { venue: Pick<VenueDetail, "name"> }) {
  return (
    <nav
      className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500"
      aria-label="Breadcrumb"
    >
      <Link href="/" className="transition-colors hover:text-white">
        Home
      </Link>
      <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600" />
      <Link href="/venues" className="transition-colors hover:text-white">
        Venues
      </Link>
      <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600" />
      <span className="text-zinc-400">{venue.name}</span>
    </nav>
  );
}

export function VenuePageHero({
  venue,
  suburbLine,
  heroImageUrl,
  matrix,
  sportSlug,
  citySlug,
  mapsSearchUrl,
}: {
  venue: VenueDetail;
  suburbLine: string;
  heroImageUrl: string;
  matrix: CtaMatrix;
  sportSlug?: string;
  citySlug: string;
  mapsSearchUrl: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      {isRemoteVenuePhoto(heroImageUrl) ? (
        <Image
          src={heroImageUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        // Same-origin SVG placeholder — next/image does not optimize SVG.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-[#0c0f0c] via-[#0c0f0c]/80 to-[#0c0f0c]/45" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-6">
          <Breadcrumbs venue={venue} />
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
          Venue
        </p>
        <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
          {venue.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {suburbLine ? (
            <p className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--color-brand)]" />
              {suburbLine}
            </p>
          ) : null}
          {typeof venue.rating === "number" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-300">
              <Star className="h-3.5 w-3.5 fill-amber-300" aria-hidden />
              {venue.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <div className="mt-6">
          <VenueUtilityBadges venue={venue} />
        </div>

        <div className="mt-6">
          <ConversionKit
            matrix={matrix}
            tone="play"
            sport={sportSlug}
            city={citySlug || null}
            slug={venue.slug}
            sourcePage={`/venues/${venue.slug}`}
            pageKey={`venue:${venue.slug}`}
            pageType="venue"
            showSticky
            showFallback={false}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-start gap-3">
          <VenueFollowButton
            venueCmsId={venue._id}
            venueName={venue.name}
            venueSlug={venue.slug}
          />
          <VenueContactActions venue={venue} directionsUrl={mapsSearchUrl} />
        </div>
      </div>
    </section>
  );
}
