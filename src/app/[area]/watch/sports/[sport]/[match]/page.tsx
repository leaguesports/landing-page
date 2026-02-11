import { EventCalendarBadge } from "@/components/EventCalendarBadge";
import { SportVenueCard } from "@/components/SportVenueCard";
import type { SportsEvent as EventType } from "@/data/events";
import { EVENT_LIST } from "@/data/events";
import { getSuburbNameBySlug } from "@/data/suburbs";
import type { Venue } from "@/data/venues";
import { VENUE_LIST } from "@/data/venues";
import { Clock, MapPin, Radio, Trophy, Tv, Users, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const MONTHS: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
    "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

function formatEventDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-");
    const monthShort = MONTHS[m ?? "01"] ?? m;
    const day = d ? parseInt(d, 10) : 0;
    const monthLong = new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-GB", { month: "long" });
    return { monthShort, day, full: `${day} ${monthLong} ${y}` };
}

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

export async function generateMetadata({
    params,
}: {
    params: Promise<{ area: string; sport: string; match: string }>;
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

export default async function WatchMatchPage({
    params,
}: {
    params: Promise<{ area: string; sport: string; match: string }>;
}) {
    const { area, match } = await params;

    const event = EVENT_LIST.find((e) => e.slug === match);

    if (!event) {
        return notFound();
    }

    const areaDisplayName = getSuburbNameBySlug(area);
    if (!areaDisplayName) {
        return notFound();
    }

    const isScotlandVsEngland = event.slug === SCOTLAND_VS_ENGLAND_SLUG;
    const kickoffTime = isScotlandVsEngland ? "18:45 SAST" : `${event.utcTime} UTC`;
    const broadcast = isScotlandVsEngland ? "SuperSport Rugby" : "Check local listings";
    const competition = isScotlandVsEngland ? "Six Nations 2026" : event.name.split(":")[0] ?? event.activity.name;
    const { monthShort, day, full: fullDate } = formatEventDate(event.date);
    const locationName = areaDisplayName;

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

    const selectedAreaVenues = getVenuesForAreaAndActivity(area, event.activity);

    return (
        <div className="relative min-h-screen bg-white overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero — Red Bull style: full-bleed image, big title, location, date block */}
            <section className="relative min-h-[80vh] sm:min-h-[80vh] flex flex-col justify-end overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {event.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- event images from external URLs
                        <img
                            src={event.imageUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover object-center"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-950 to-zinc-800" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/20" />
                </div>
                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-24">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-2">
                        {event.name.includes(":") ? event.name.split(":")[1]?.trim() ?? event.name : event.name}
                    </h1>
                    <p className="text-xl sm:text-2xl text-white/70 font-light mb-8">
                        Aviva Stadium, Ireland
                    </p>
                    <div className="flex flex-wrap items-end gap-6 sm:gap-10">
                        <div className=" py-3 px-3 rounded-md border border-white/20 bg-white/10 shadow-lg backdrop-blur-xs flex items-center gap-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                            <EventCalendarBadge month={monthShort} day={day} className="shrink-0" />
                            <div className="text-sm sm:text-sm text-white/90 font-medium">{fullDate}</div>
                        </div>
                        {/* <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white">
                                {locationName}
                            </span>
                            <span className="rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white">
                                South Africa
                            </span>
                        </div> */}
                    </div>
                </div>
            </section>

            {/* Part of event series + editorial intro */}
            <section className="bg-zinc-100 py-10 sm:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                        Part of event series
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">{competition}</h2>
                    <p className="text-lg text-zinc-600 max-w-2xl mb-6">
                        {competition.includes("Six Nations")
                            ? "The Six Nations Championship brings together the best of European rugby. Catch every try and tackle live at venues across Johannesburg."
                            : `Catch ${event.activity.name} live. Find the best venues in Johannesburg showing this match.`}
                    </p>
                    <div className="h-px bg-zinc-200 max-w-2xl" />
                </div>
            </section>

            {/* Match Info — clean strip */}
            <section
                className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
                aria-labelledby="match-info-heading"
            >
                <h2 id="match-info-heading" className="sr-only">
                    Match Info
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                            <Clock className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Kickoff</p>
                            <p className="text-xl font-semibold text-zinc-900">{kickoffTime}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                            <Radio className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Broadcast</p>
                            <p className="text-xl font-semibold text-zinc-900">{broadcast}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Trophy className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Competition</p>
                            <p className="text-xl font-semibold text-zinc-900">{competition}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why watch at a venue */}
            <section className="bg-emerald-50 py-12 sm:py-16" aria-labelledby="why-venue-heading">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 id="why-venue-heading" className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-10">
                        Why watch at a venue?
                    </h2>
                    <div className="grid gap-8 sm:grid-cols-3">
                        <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                <Users className="h-6 w-6" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 mb-1">Atmosphere</h3>
                                <p className="text-zinc-600 text-sm">
                                    Share the tension and celebrations with other fans. There’s nothing like watching the big moments together.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                <Tv className="h-6 w-6" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 mb-1">Big screen, no buffering</h3>
                                <p className="text-zinc-600 text-sm">
                                    Reliable coverage on large screens so you don’t miss a single try or conversion.
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
                                    Order from the menu and enjoy the match with a drink and something to eat.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Get match-ready */}
            <section className="border-y border-zinc-200 py-8 sm:py-10" aria-labelledby="match-ready-heading">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 id="match-ready-heading" className="text-lg font-semibold text-zinc-900 mb-2">
                        Get match-ready
                    </h2>
                    <p className="text-zinc-600 max-w-2xl text-sm sm:text-base">
                        Arrive a bit early to grab a good spot and order before kickoff. Venues fill up for the big games—book a table if you’re coming with a group.
                    </p>
                </div>
            </section>

            {/* Venues in the selected area only */}
            {selectedAreaVenues.length > 0 && (
                <section
                    className="bg-zinc-50 py-10 sm:py-14"
                    aria-labelledby="venues-heading"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2
                            id="venues-heading"
                            className="mb-5 flex items-center gap-3 text-2xl font-bold text-zinc-900"
                        >
                            <MapPin className="h-7 w-7 text-emerald-600" strokeWidth={2} />
                            Best Venues to Watch in {areaDisplayName}
                        </h2>
                        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {selectedAreaVenues.map((venue) => (
                                <li key={venue.id}>
                                    <SportVenueCard
                                        href={`/${area}/venues/${venue.slug}`}
                                        image={venue.image}
                                        name={venue.name}
                                        type={getVenueType(venue)}
                                        showing={`Showing ${event.activity.name}`}
                                        area={venue.area}
                                        accent="emerald"
                                        variant="light"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </div>
    );
}
