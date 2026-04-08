/* eslint-disable @next/next/no-img-element */
import { ACTIVITIES } from "@/data/activity";
import {
    getVenueType,
    type Venue,
    VENUE_LIST,
} from "@/data/venues";
import {
    Bell,
    Car,
    ChevronRight,
    Dog,
    Flag,
    Heart,
    MapPin,
    Wifi,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const NAV_LINKS = [
    { label: "About", href: "#about" },
    { label: "Sports", href: "#sports" },
    { label: "Amenities", href: "#amenities" },
    { label: "Events", href: "#events" },
    { label: "Location", href: "#location" },
];

/** Shown when real listing data is missing (temporary demo content). */
const DUMMY_WATCH = [
    ACTIVITIES.FORMULA_1,
    ACTIVITIES.RUGBY,
    ACTIVITIES.SOCCER,
];
const DUMMY_PLAY = [ACTIVITIES.GOLF, ACTIVITIES.PADEL];

const DUMMY_AMENITIES = [
    { icon: Wifi, label: "Free Wi‑Fi" },
    { icon: Car, label: "Parking" },
    { icon: Dog, label: "Pet friendly" },
] as const;

const DUMMY_UPCOMING = {
    eyebrow: "Live screening · sample",
    title: "Rugby: Lions vs Sharks",
    meta: "SAT · Kickoff 15:00 · Placeholder listing",
};

type Props = { params: Promise<{ venue: string }> };

function getVenueBySlug(slug: string): Venue | undefined {
    return VENUE_LIST.find((v) => v.slug === slug);
}

function getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "https://leaguesports.co.za";
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ venue: string }>;
}): Promise<Metadata> {
    const { venue: slug } = await params;
    const venue = getVenueBySlug(slug);
    if (!venue) return { title: "Venue Not Found" };
    const type = getVenueType(venue);
    const title = `${venue.name} | ${venue.area}`;
    const canonicalPath = `/venues/${venue.slug}`;
    const baseUrl = getBaseUrl();
    const canonicalUrl = `${baseUrl}${canonicalPath}`;

    return {
        title,
        description: `${venue.name} — ${type} in ${venue.area}. ${venue.description}`,
        keywords: [
            venue.name,
            venue.area,
            "Venues",
            "Sports",
            "LeagueSports",
        ],
        openGraph: {
            title,
            description: venue.description,
            url: canonicalUrl,
            siteName: "LeagueSports",
            type: "website",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: venue.description,
        },
        alternates: {
            canonical: canonicalUrl,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

function Breadcrumbs({ venue }: { venue: Venue }) {
    return (
        <nav
            className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500"
            aria-label="Breadcrumb"
        >
            <Link href="/" className="hover:text-white transition-colors">
                Home
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0 text-zinc-600" />
            <Link href="/venues" className="hover:text-white transition-colors">
                Venues
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0 text-zinc-600" />
            <span className="text-zinc-400">{venue.name}</span>
        </nav>
    );
}

export default async function VenuePage({ params }: Props) {
    const { venue: venueSlug } = await params;
    const venue = getVenueBySlug(venueSlug);
    if (!venue) return notFound();

    const venueType = getVenueType(venue);
    const watchActivities = venue.watch ?? [];
    const playActivities = venue.play ?? [];

    const displayWatch =
        watchActivities.length > 0 ? watchActivities : DUMMY_WATCH;
    const displayPlay =
        playActivities.length > 0 ? playActivities : DUMMY_PLAY;
    const sportsUsesDummy =
        watchActivities.length === 0 || playActivities.length === 0;

    const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${venue.name} ${venue.area}`,
    )}`;

    return (
        <div>
            <div className="min-h-screen bg-[#0f0f0f] text-white">
                {/* In-page nav */}
                <nav className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/5">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
                            <div className="flex items-center gap-2 mr-6 shrink-0">
                                <div className="bg-red-600 px-3 py-1 transform -skew-x-6">
                                    <span className="transform skew-x-6 block text-xs font-black uppercase tracking-widest text-white">
                                        Venue
                                    </span>
                                </div>
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest hidden sm:block truncate max-w-48">
                                    {venue.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 flex-1">
                                {NAV_LINKS.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0 transform -skew-x-6"
                                    >
                                        <span className="transform skew-x-6 block">
                                            {link.label}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative overflow-hidden min-h-[70vh] sm:min-h-[75vh] flex items-end">
                    <div className="absolute inset-0 bg-linear-to-br from-red-950/60 via-[#0f0f0f] to-[#0f0f0f]" />

                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-px bg-linear-to-r from-transparent via-red-600/30 to-transparent"
                                style={{
                                    top: `${10 + i * 12}%`,
                                    left: "-10%",
                                    right: "-10%",
                                    transform: `skewY(-${1 + i * 0.5}deg)`,
                                    opacity: 0.4 - i * 0.04,
                                }}
                            />
                        ))}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                        <span
                            className="text-[22vw] sm:text-[28vw] font-black italic uppercase text-white/2 leading-none tracking-tighter"
                            style={{ fontStretch: "condensed" }}
                        >
                            Venue
                        </span>
                    </div>

                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-700 via-red-500 to-red-700" />

                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-12 sm:pt-16 w-full">
                        <div className="mb-6">
                            <Breadcrumbs venue={venue} />
                        </div>

                        <p className="text-red-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-3">
                            {venueType}
                        </p>

                        <h1 className="text-4xl sm:text-7xl lg:text-[5rem] font-black italic uppercase leading-[0.95] tracking-tighter mb-4">
                            <span className="text-red-white">{venue.name}</span>
                        </h1>

                        <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-xs sm:text-sm mb-10 max-w-2xl">
                            {venue.description}
                        </p>

                        <div className="flex flex-wrap gap-6 mb-10">
                            {[
                                {
                                    label: "Watch",
                                    value: displayWatch.length,
                                },
                                {
                                    label: "Play",
                                    value: displayPlay.length,
                                },
                            ].map((stat) => (
                                <div key={stat.label} className="flex flex-col">
                                    <span className="text-3xl font-black italic text-white leading-none">
                                        {stat.value}
                                    </span>
                                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                        Sports · {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <Link
                                href="/discover"
                                className="group relative flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm transition-all transform -skew-x-6 overflow-hidden bg-white text-black hover:bg-red-600 hover:text-white"
                            >
                                <span className="transform skew-x-6 flex items-center gap-3">
                                    <Heart className="w-5 h-5 transition-all group-hover:fill-white" />
                                    Find more venues
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                            </Link>

                            <a
                                href="#location"
                                className="flex items-center gap-2 text-zinc-400 hover:text-white font-black uppercase italic tracking-wider text-sm transition-colors"
                            >
                                Directions <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
                </section>

                {/* Hero image */}
                {/* <section className="px-4 sm:px-6 lg:px-8 -mt-4 pb-12 sm:pb-16">
                    <div className="mx-auto max-w-7xl">
                        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-lg shadow-red-950/20">
                            <div className="h-1 w-full bg-red-600" />
                            <div className="aspect-21/9 sm:aspect-[2.4/1] w-full">
                                <img
                                    src={venue.image}
                                    alt={venue.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section> */}

                {/* About */}
                <section
                    id="about"
                    className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-12 sm:pt-16 w-full">
                        <div className="mb-8 sm:mb-10">
                            <h2 className="bg-red-600 inline-block px-4 sm:px-6 py-1.5 rounded mb-2 sm:mb-3 text-white font-black italic uppercase text-xl sm:text-2xl">
                                About
                            </h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                                {venueType} · {venue.area}
                            </p>
                        </div>
                        <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-3xl font-medium">
                            {venue.description}
                        </p>
                    </div>
                </section>

                {/* Sports */}
                <section
                    id="sports"
                    className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 scroll-mt-24"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-12 sm:pt-16 w-full">
                        <div className="mb-8 sm:mb-12">
                            <h2 className="bg-red-600 inline-block px-4 sm:px-6 py-1.5 rounded mb-2 sm:mb-3 text-white font-black italic uppercase text-xl sm:text-2xl">
                                Sports at this venue
                            </h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                                Watch and play what&apos;s on offer
                            </p>
                        </div>

                        {sportsUsesDummy && (
                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                                Sample sports shown where listing data is still
                                pending.
                            </p>
                        )}

                        <div className="grid gap-8 sm:grid-cols-2">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 mb-4">
                                    Watch
                                </h3>
                                <ul className="flex flex-wrap gap-2">
                                    {displayWatch.map((a) => (
                                        <li
                                            key={a.id}
                                            className="px-4 py-2 rounded border border-zinc-800 bg-zinc-950 text-sm font-black italic uppercase text-white hover:border-red-600/50 transition-colors"
                                        >
                                            {a.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 mb-4">
                                    Play
                                </h3>
                                <ul className="flex flex-wrap gap-2">
                                    {displayPlay.map((a) => (
                                        <li
                                            key={a.id}
                                            className="px-4 py-2 rounded border border-zinc-800 bg-zinc-950 text-sm font-black italic uppercase text-white hover:border-red-600/50 transition-colors"
                                        >
                                            {a.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-3">
                            <Link
                                href="/discover?intent=watch"
                                className="inline-flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-widest hover:text-red-300 transition-colors"
                            >
                                Find places to watch{" "}
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                            <span className="text-zinc-700 hidden sm:inline">
                                |
                            </span>
                            <Link
                                href="/discover?intent=play"
                                className="inline-flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-widest hover:text-red-300 transition-colors"
                            >
                                Find places to play{" "}
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Amenities (dummy data for now) */}
                <section
                    id="amenities"
                    className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 scroll-mt-24"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-12 sm:pt-16 w-full">
                        <div className="mb-8 sm:mb-10">
                            <h2 className="bg-red-600 inline-block px-4 sm:px-6 py-1.5 rounded mb-2 sm:mb-3 text-white font-black italic uppercase text-xl sm:text-2xl">
                                Amenities
                            </h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                                Sample amenities · replace with real venue data
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {DUMMY_AMENITIES.map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-300"
                                >
                                    <Icon
                                        className="w-4 h-4 shrink-0 text-red-500"
                                        aria-hidden
                                    />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Events (dummy data for now) */}
                <section
                    id="events"
                    className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 scroll-mt-24"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-12 sm:pt-16 w-full">
                        <div className="mb-8 sm:mb-10">
                            <h2 className="bg-red-600 inline-block px-4 sm:px-6 py-1.5 rounded mb-2 sm:mb-3 text-white font-black italic uppercase text-xl sm:text-2xl">
                                What&apos;s on
                            </h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                                Sample event · placeholder until calendar is wired
                            </p>
                        </div>
                        <div className="max-w-xl overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 transition-all duration-300 hover:border-red-600/50">
                            <div className="h-1 w-full bg-red-600" />
                            <div className="p-5 sm:p-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-2">
                                    {DUMMY_UPCOMING.eyebrow}
                                </p>
                                <h3 className="font-black italic uppercase text-lg sm:text-xl text-white leading-tight mb-2">
                                    {DUMMY_UPCOMING.title}
                                </h3>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                                    {DUMMY_UPCOMING.meta}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section
                    id="location"
                    className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 scroll-mt-24"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-12 sm:pt-16 w-full">
                        <div className="mb-8 sm:mb-10">
                            <h2 className="bg-red-600 inline-block px-4 sm:px-6 py-1.5 rounded mb-2 sm:mb-3 text-white font-black italic uppercase text-xl sm:text-2xl">
                                Location
                            </h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                                Area &amp; maps
                            </p>
                        </div>

                        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 sm:p-6 max-w-2xl">
                            <div className="flex items-start gap-3 mb-4">
                                <MapPin className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                                <div>
                                    <p className="font-black italic uppercase text-white leading-tight">
                                        {venue.name}
                                    </p>
                                    <p className="text-zinc-400 text-sm font-bold mt-1">
                                        {venue.area}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={mapsSearchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 font-black uppercase italic tracking-wider text-sm border border-white/20 text-white hover:border-red-500 hover:text-red-400 transition-all transform -skew-x-6"
                            >
                                <span className="transform skew-x-6 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Open in Google Maps
                                </span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* CTA banner */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950">
                    <div className="absolute inset-0 bg-linear-to-r from-red-950/40 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-red-600 via-red-400 to-transparent" />

                    <div className="mx-auto max-w-7xl relative">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Flag className="w-6 h-6 text-red-500" />
                                    <span className="text-red-400 text-xs font-black uppercase tracking-[0.3em]">
                                        Stay in the loop
                                    </span>
                                </div>
                                <h2 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-3">
                                    More <span className="text-red-500">venues</span>
                                </h2>
                                <p className="text-zinc-500 font-bold text-sm max-w-md">
                                    Discover screenings, fan zones, and places to
                                    play near you.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 shrink-0">
                                <Link
                                    href="/venues"
                                    className="flex items-center justify-center gap-3 px-10 py-3 font-black uppercase italic tracking-wider text-sm bg-white text-black hover:bg-red-600 hover:text-white transition-all transform -skew-x-6"
                                >
                                    <span className="transform skew-x-6">
                                        Browse all venues
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-3 px-10 py-3 font-black uppercase italic tracking-wider text-sm border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-red-400 transition-all transform -skew-x-6"
                                >
                                    <span className="transform skew-x-6 flex items-center gap-3">
                                        <Bell className="w-4 h-4" />
                                        Venue alerts
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
