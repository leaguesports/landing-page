import {
  getVenueType,
  type Venue,
  VENUE_LIST,
} from "@/data/venues";
import { getSuburbNameBySlug } from "@/data/suburbs";
import {
  ChevronLeft,
  MapPin,
  Tv,
  Dumbbell,
  UtensilsCrossed,
  Users,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ area: string; venue: string }> };

function getVenueBySlug(slug: string): Venue | undefined {
  return VENUE_LIST.find((v) => v.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string; venue: string }>;
}): Promise<Metadata> {
  const { venue: slug } = await params;
  const venue = getVenueBySlug(slug);
  if (!venue) return { title: "Venue Not Found" };
  const type = getVenueType(venue);
  return {
    title: `${venue.name} | ${venue.area} | League Sports`,
    description: `${venue.name} is a ${type.toLowerCase()} in ${venue.area}. ${venue.description}`,
  };
}

export default async function VenuePage({ params }: Props) {
  const { area, venue: venueSlug } = await params;
  const venue = getVenueBySlug(venueSlug);
  if (!venue) return notFound();

  const areaName = getSuburbNameBySlug(area) ?? area;
  const type = getVenueType(venue);
  const hasWatch = venue.watch && venue.watch.length > 0;
  const hasPlay = venue.play && venue.play.length > 0;

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Back nav */}
      <div className="absolute top-0 left-0 right-0 z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href={`/${area}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors rounded-lg py-2 pr-3 pl-2 -ml-2 hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          Back to {areaName}
        </Link>
      </div>

      {/* Hero — full-bleed image, gradient overlay */}
      <section className="relative min-h-[70vh] sm:min-h-[75vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- venue images from external URLs */}
          <img
            src={venue.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-black/20" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-2">
            {type}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-4">
            {venue.name}
          </h1>
          <p className="flex items-center gap-2 text-xl sm:text-2xl text-white/90 font-medium">
            <MapPin className="h-6 w-6 text-emerald-400 shrink-0" strokeWidth={2} />
            {venue.area}, South Africa
          </p>
        </div>
      </section>

      {/* About — description and type */}
      <section className="bg-zinc-50 py-12 sm:py-16" aria-labelledby="about-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="about-heading" className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-6">
            About
          </h2>
          <p className="text-lg text-zinc-600 max-w-3xl leading-relaxed">
            {venue.description}
          </p>
          <div className="mt-8 h-px bg-zinc-200 max-w-2xl" />
        </div>
      </section>

      {/* What's on — watch & play */}
      <section
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
        aria-labelledby="whats-on-heading"
      >
        <h2
          id="whats-on-heading"
          className="mb-8 flex items-center gap-3 text-2xl sm:text-3xl font-bold text-zinc-900"
        >
          <Sparkles className="h-7 w-7 text-amber-500" strokeWidth={2} />
          What&apos;s on
        </h2>
        <div className="flex flex-wrap gap-4">
          {hasWatch && (
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-500">
                <Tv className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                Watch
              </span>
              <div className="flex flex-wrap gap-2">
                {venue.watch!.map((activity) => (
                  <span
                    key={activity.id}
                    className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800"
                  >
                    {activity.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {hasPlay && (
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-500">
                <Dumbbell className="h-4 w-4 text-amber-600" strokeWidth={2} />
                Play
              </span>
              <div className="flex flex-wrap gap-2">
                {venue.play!.map((activity) => (
                  <span
                    key={activity.id}
                    className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800"
                  >
                    {activity.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why visit — value props */}
      <section className="bg-emerald-50 py-12 sm:py-16" aria-labelledby="why-visit-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="why-visit-heading" className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-10">
            Why visit?
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Users className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">Great atmosphere</h3>
                <p className="text-zinc-600 text-sm">
                  Join fellow fans and players in a welcoming space built for sport and socialising.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Tv className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">Screens & coverage</h3>
                <p className="text-zinc-600 text-sm">
                  Catch every moment on big screens with reliable coverage for the games that matter.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <UtensilsCrossed className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">Food & drinks</h3>
                <p className="text-zinc-600 text-sm">
                  Refuel with a full menu and drinks so you can focus on the action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location strip */}
      <section className="border-t border-zinc-200 py-8 sm:py-10" aria-labelledby="location-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="location-heading" className="sr-only">
            Location
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-zinc-100 px-5 py-4">
              <MapPin className="h-5 w-5 text-emerald-600 shrink-0" strokeWidth={2} />
              <div>
                <p className="text-sm font-medium text-zinc-500">Location</p>
                <p className="font-semibold text-zinc-900">{venue.area}, South Africa</p>
              </div>
            </div>
            <Link
              href={`/${area}`}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-4 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
            >
              Explore more in {areaName}
              <ChevronLeft className="h-4 w-4 rotate-180" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
