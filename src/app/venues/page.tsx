/* eslint-disable @next/next/no-img-element */
import {
  VenueContactActions,
  VenueUtilityBadges,
} from "@/components/VenueUtilityBadges";
import { urlFor } from "@/sanity/client";
import { listVenues, Venue } from "@/services/venues";
import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";

function getVenueImageSrc(venue: Venue) {
  if (venue.broadcasts && venue.broadcasts.length) {
    return "https://images.unsplash.com/photo-1775642679594-89bb4b78e26e?q=80&w=1470&auto=format&fit=crop";
  }

  if (venue.sports && venue.sports.length > 0 && venue.sports[0].image) {
    return urlFor(venue.sports[0].image)!.url();
  }

  return "https://blocks.astratic.com/img/general-img-landscape.png";
}

function VenueCard({ venue }: { venue: Venue }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-white/8 bg-[#141814] transition-colors hover:border-white/16">
      <Link href={`/venues/${venue.slug}`} className="block">
        <div className="relative">
          <img
            className="h-48 w-full object-cover"
            src={getVenueImageSrc(venue)}
            alt=""
          />
          {venue.has_generator_backup && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-300 backdrop-blur-sm">
              Generator backup
            </div>
          )}
        </div>
        <div className="p-5 pb-3">
          <h3 className="text-base font-medium leading-snug text-white transition-colors group-hover:text-[var(--color-brand)] sm:text-lg">
            {venue.name}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{venue.address.suburb}</span>
          </div>
          <VenueUtilityBadges venue={venue} className="mt-3" />
        </div>
      </Link>
      <div className="px-5 pb-5">
        <VenueContactActions venue={venue} />
      </div>
    </div>
  );
}

export default async function VenuesPage() {
  const venues = await listVenues();

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <nav className="sticky top-16 z-40 border-b border-white/6 bg-[#0c0f0c]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[var(--color-brand)] px-3.5 py-1.5 text-xs font-semibold text-zinc-950">
            Venues
          </span>
          <span className="hidden text-sm text-zinc-500 sm:inline">
            Watch &amp; play spots
          </span>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/35 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Directory
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
            Venues
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
            Bars, fan zones, courts, and clubs across South Africa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/watch"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Watch directory
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/play"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Play directory
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section id="venues" className="scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 sm:mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              All venues
            </p>
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              Explore the list
            </h2>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {venues.map((venue) => (
              <VenueCard key={venue._id} venue={venue} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
