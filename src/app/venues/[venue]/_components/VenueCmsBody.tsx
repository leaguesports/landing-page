import { VenueUtilityBadges } from "@/components/VenueUtilityBadges";
import {
  venueAmenitiesDescription,
  venueStayCloseCopy,
  type VenueDetailKind,
} from "@/lib/venues/detail-ia";
import { hasVenueCoordinates, type VenueDetail } from "@/services/venues";
import { Flag, MapPin } from "lucide-react";
import Link from "next/link";
import { VenueAboutSection } from "./VenueAboutSection";
import { VenueClaimBar } from "./VenueClaimBar";
import { VenueFollowButton } from "./VenueFollowButton";
import { VenueMap } from "./VenueMap";

export function VenueCmsBody({
  venue,
  kind,
  mapsSearchUrl,
  addressLine,
  showClaimBar,
}: {
  venue: VenueDetail;
  kind: VenueDetailKind;
  mapsSearchUrl: string;
  addressLine: string;
  showClaimBar: boolean;
}) {
  return (
    <>
      <VenueAboutSection venue={venue} />

      <section
        id="amenities"
        className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8 sm:mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Amenities
            </p>
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              Amenities
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              {venueAmenitiesDescription(kind)}
            </p>
          </header>
          <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
            <VenueUtilityBadges venue={venue} />
          </div>
        </div>
      </section>

      <section
        id="location"
        className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8 sm:mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Location
            </p>
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              Location
            </h2>
            <p className="mt-2 text-sm text-zinc-500">Area & maps</p>
          </header>
          <div className="max-w-2xl rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand)]" />
              <div>
                <p className="font-display text-2xl leading-tight tracking-wide text-white">
                  {venue.name}
                </p>
                {addressLine ? (
                  <p className="mt-1 text-sm text-zinc-400">{addressLine}</p>
                ) : null}
              </div>
            </div>
            {hasVenueCoordinates(venue) ? (
              <div className="mb-5">
                <VenueMap
                  lat={venue.latitude}
                  lng={venue.longitude}
                  name={venue.name}
                />
              </div>
            ) : null}
            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              <MapPin className="h-4 w-4" />
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/5 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-950/25 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-white/8 bg-[#141814] p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Flag className="h-4 w-4 text-[var(--color-brand)]" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                  Stay in the loop
                </span>
              </div>
              <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                Stay close to {venue.name}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
                {venueStayCloseCopy(kind)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <VenueFollowButton
                venueCmsId={venue._id}
                venueName={venue.name}
                venueSlug={venue.slug}
                variant="secondary"
              />
              <Link
                href="/venues"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-8 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[var(--color-brand)]"
              >
                Browse all venues
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showClaimBar ? (
        <VenueClaimBar venueName={venue.name} venueSlug={venue.slug} />
      ) : null}
    </>
  );
}
