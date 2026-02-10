import { FeaturedEventCard } from "@/components/FeaturedEventCard";
import { SportVenueCard } from "@/components/SportVenueCard";
import { EVENT_LIST } from "@/data/events";
import { getSuburbNameBySlug } from "@/data/suburbs";
import { VENUE_LIST } from "@/data/venues";
import type { SportsEvent as EventType } from "@/data/events";
import type { Venue } from "@/data/venues";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Radio, Trophy, MapPin } from "lucide-react";

function getVenueType(venue: Venue): string {
  const match = venue.description.match(/ is a ([^.]+) in /i);
  return match ? match[1].trim() : "Sports venue";
}

const SCOTLAND_VS_ENGLAND_SLUG = "scotland-vs-england";

function getVenuesForAreaAndActivity(areaSlug: string, activity: EventType["activity"]) {
  const areaName = getSuburbNameBySlug(areaSlug);
  if (!areaName) return [];
  return VENUE_LIST.filter((venue) => {
    const venueAreaName = venue.area.split(",")[0]?.trim() ?? "";
    const watchesActivity = venue.watch?.some((a) => a.id === activity.id) ?? false;
    return venueAreaName === areaName && watchesActivity;
  });
}

function getVenuesForActivity(activity: EventType["activity"]) {
  return VENUE_LIST.filter(
    (venue) => venue.watch?.some((a) => a.id === activity.id) ?? false
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ match: string }>;
}): Promise<Metadata> {
  const { match } = await params;
  const event = EVENT_LIST.find((e) => e.slug === match);

  if (!event) {
    return { title: "Match Not Found" };
  }

  if (event.slug === SCOTLAND_VS_ENGLAND_SLUG) {
    return {
      title: "Scotland vs England | 14 Feb 2026 | Where to Watch in Johannesburg",
      description:
        "Watch Scotland vs England live in Johannesburg. Find the best venues in Sandton, Midrand, and Fourways showing the Six Nations with full match details and kickoff times.",
    };
  }

  const areaList = event.areas?.length
    ? event.areas.map((s) => getSuburbNameBySlug(s) ?? s).join(", ")
    : "Johannesburg";
  return {
    title: `${event.name} | Where to Watch in ${areaList}`,
    description: `Watch ${event.name} live in Johannesburg. Find venues showing ${event.activity.name} with match details and times.`,
  };
}

export default async function RugbyMatchPage({
  params,
}: {
  params: Promise<{ match: string }>;
}) {
  const { match } = await params;

  const event = EVENT_LIST.find((e) => e.slug === match);

  if (!event) {
    return notFound();
  }

  const isScotlandVsEngland = event.slug === SCOTLAND_VS_ENGLAND_SLUG;
  const kickoffTime = isScotlandVsEngland ? "18:45 SAST" : `${event.utcTime} UTC`;
  const broadcast = isScotlandVsEngland ? "SuperSport Rugby" : "Check local listings";
  const competition = isScotlandVsEngland ? "Six Nations 2026" : event.name.split(":")[0] ?? event.activity.name;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: isScotlandVsEngland ? "Six Nations: Scotland vs England" : event.name,
    startDate: isScotlandVsEngland ? "2026-02-14T18:45:00+02:00" : `${event.date}T${event.utcTime}:00+02:00`,
    homeTeam: isScotlandVsEngland ? "Scotland" : undefined,
    awayTeam: isScotlandVsEngland ? "England" : undefined,
    sport: "Rugby",
    location: {
      "@type": "Place",
      name: "Various Venues",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Johannesburg",
        addressCountry: "South Africa",
      },
    },
  };

  const areasToShow = event.areas?.length ? event.areas : [];
  const venueSections = areasToShow.map((areaSlug) => {
    const areaName = getSuburbNameBySlug(areaSlug) ?? areaSlug;
    const venues = getVenuesForAreaAndActivity(areaSlug, event.activity);
    return { areaSlug, areaName, venues };
  });

  const allActivityVenues = getVenuesForActivity(event.activity);
  const shownVenueIds = new Set(venueSections.flatMap((s) => s.venues.map((v) => v.id)));
  const moreVenues = allActivityVenues.filter((v) => !shownVenueIds.has(v.id));

  const otherAreaLinks = [
    { slug: "midrand", label: "Midrand" },
    { slug: "fourways", label: "Fourways" },
    { slug: "roodepoort", label: "West Rand" },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[80vh] w-full bg-linear-to-b from-emerald-950/30 via-transparent to-transparent" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-size-[3rem_3rem]" />
      </div>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FeaturedEventCard
            image={event.imageUrl ?? ""}
            title={event.name}
            sport={event.activity.name}
            date={event.date}
            location={event.areas?.[0] ?? ""}
            description={`Watch the ${event.name} at ${event.areas?.[0] ?? ""}`}
          />
        </div>
      </section>

      {/* Match Info — card strip */}
      <section
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
        aria-labelledby="match-info-heading"
      >
        <h2 id="match-info-heading" className="sr-only">
          Match Info
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Clock className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/60">Kickoff</p>
              <p className="text-lg font-semibold text-white">{kickoffTime}</p>
            </div>
          </div>
          <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Radio className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/60">Broadcast</p>
              <p className="text-lg font-semibold text-white">{broadcast}</p>
            </div>
          </div>
          <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Trophy className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/60">Competition</p>
              <p className="text-lg font-semibold text-white">{competition}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Venues by area — only show cards that have venues */}
      {venueSections.some((s) => s.venues.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="space-y-10">
            {venueSections
              .filter(({ venues }) => venues.length > 0)
              .map(({ areaSlug, areaName, venues }) => (
                <section
                  key={areaSlug}
                  aria-labelledby={`venues-${areaSlug}-heading`}
                >
                  <h2
                    id={`venues-${areaSlug}-heading`}
                    className="mb-5 flex items-center gap-3 text-2xl font-bold text-white"
                  >
                    <MapPin className="h-7 w-7 text-emerald-400" strokeWidth={2} />
                    Best Venues to Watch in {areaName}
                  </h2>
                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {venues.map((venue) => (
                      <li key={venue.id}>
                        <SportVenueCard
                          href="/venues"
                          image={venue.image}
                          name={venue.name}
                          type={getVenueType(venue)}
                          showing={`Showing ${event.activity.name}`}
                          area={venue.area}
                          accent="emerald"
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
          </div>
        </section>
      )}

      {/* More venues showing this event (e.g. other suburbs) */}
      {moreVenues.length > 0 && (
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
          aria-labelledby="more-venues-heading"
        >
          <h2
            id="more-venues-heading"
            className="mb-5 flex items-center gap-3 text-2xl font-bold text-white"
          >
            <MapPin className="h-7 w-7 text-emerald-400" strokeWidth={2} />
            More venues showing {event.activity.name} in Johannesburg
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {moreVenues.map((venue) => (
              <li key={venue.id}>
                <SportVenueCard
                  href="/venues"
                  image={venue.image}
                  name={venue.name}
                  type={getVenueType(venue)}
                  showing={`Showing ${event.activity.name}`}
                  area={venue.area}
                  accent="emerald"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Other areas CTA */}
      <section
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 pb-20"
        aria-labelledby="other-areas-heading"
      >
        <div className="rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 px-6 py-8 backdrop-blur-sm">
          <h2 id="other-areas-heading" className="mb-4 text-lg font-semibold text-white">
            Looking for other areas?
          </h2>
          <p className="mb-5 text-white/80">
            View venues in{" "}
            {otherAreaLinks.map(({ slug, label }, i) => (
              <span key={slug}>
                {i > 0 && ", "}
                {i === otherAreaLinks.length - 1 && "or "}
                <Link
                  href={`/${slug}`}
                  className="font-medium text-emerald-400 underline underline-offset-2 transition-colors hover:text-emerald-300"
                >
                  {label}
                </Link>
              </span>
            ))}
            .
          </p>
          <div className="flex flex-wrap gap-3">
            {otherAreaLinks.map(({ slug, label }) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/20"
              >
                <MapPin className="h-4 w-4" strokeWidth={2} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
