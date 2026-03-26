import { sanityClient } from "@/sanity/client";
import { Bell, ChevronRight, Flag, Heart, MapPin, Tv } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

const NAV_LINKS = [
    { label: "Venues", href: "#venues" },
    { label: "Sports", href: "#sports" },
    { label: "Players", href: "#players" },
];

type Location = {
    id: string;
    slug: string;
    title: string;
};

type Venue = {
    id: string;
    slug: string;
    name: string;
}

type Sport = {
    id: string;
    slug: string;
    name: string;
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

async function getLocationBySlug(slug: string) {
    if (!slug) return null;

    const race = await sanityClient.fetch<Location>(
        `*[_type == "location" && slug.current == $slug][0] {
          "id": _id,
          "slug": slug.current,
          "title": title,
          }`,
        { slug },
    );

    return race;
}

async function getSportBySlug(slug: string) {
    if (!slug) return null;

    const sport = await sanityClient.fetch<Sport>(
        `*[_type == "sport" && slug.current == $slug][0] {
            "id": _id,
            "slug": slug.current,
            "name": name,
        }`,
        { slug },
    );

    return sport;
}

async function getVenuesByLocationAndSport(location: string, sport: string) {
    if (!location || !sport) return [];

    const venues = await sanityClient.fetch<Venue[]>(
        `*[_type == "venue" && 
        // 1. Check the array of sports references
        $sport in broadcasts[]->slug.current && 
        // 2. Check the location reference (and its parent for the city/suburb logic)
        (
            location->slug.current == $location || 
            location->parent->slug.current == $location
        )
        ] {
            "id": _id,
            "slug": slug.current,
            "name": name,
        }`,
        { location, sport },
    );

    return venues;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ route: string[] }>;
}): Promise<Metadata> {
    const { route: [sportSlug, locationSlug] } = await params;
    const location = await getLocationBySlug(locationSlug);
    const sport = await getSportBySlug(sportSlug);
    if (!location) return { title: "Location Not Found" };

    const title = `${location.title} | Watch`;
    const canonicalPath = `/watch/${sportSlug}/${locationSlug}`;
    const baseUrl = getBaseUrl();
    const canonicalUrl = `${baseUrl}${canonicalPath}`;

    return {
        title,
        description: `${location.title} | Watch`,
        keywords: [
            "Watch",
            "Sports",
            "Venues",
            "Locations",
            "Sports Venues",
            "Sports Locations",
            "Sports Venues Locations",
            "Sports Venues Locations",
            "Sports Bars"
        ],
        openGraph: {
            title,
            description: `${location.title} | Watch`,
            url: canonicalUrl,
            siteName: "LeagueSports",
            type: "website",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: `${location.title} | Watch`,
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

export default async function WatchPage(route: { params: Promise<{ route: string[] }> }) {
    const params = await route.params;
    const [sportSlug, locationSlug] = params?.route ?? [];

    const location = await getLocationBySlug(locationSlug);
    const sport = await getSportBySlug(sportSlug);
    const venues = await getVenuesByLocationAndSport(locationSlug, sportSlug);

    return (
        <div>
            <div className="min-h-screen bg-[#0f0f0f] text-white">

                {/* ─── In-page nav ─────────────────────────────────────────────── */}
                <nav className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/5">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
                            {/* Sport badge */}
                            <div className="flex items-center gap-2 mr-6 shrink-0">
                                <div className="bg-blue-600 px-3 py-1 transform -skew-x-6">
                                    <span className="transform skew-x-6 block text-xs font-black uppercase tracking-widest text-white">
                                        Watch
                                    </span>
                                </div>
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest hidden sm:block">
                                    {sport?.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 flex-1">
                                {NAV_LINKS.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0 transform -skew-x-6"
                                    >
                                        <span className="transform skew-x-6 block">{link.label}</span>
                                    </a>
                                ))}
                            </div>

                        </div>
                    </div>
                </nav>

                {/* ─── Hero ─────────────────────────────────────────────────────── */}
                <section className="relative overflow-hidden min-h-[85vh] flex items-end">

                    {/* Background layers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-[#0f0f0f] to-[#0f0f0f]" />

                    {/* Speed lines */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent"
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

                    {/* Large F1 background text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                        <span
                            className="text-[28vw] font-black italic uppercase text-white/[0.02] leading-none tracking-tighter"
                            style={{ fontStretch: "condensed" }}
                        >
                            Watch
                        </span>
                    </div>

                    {/* Red accent bar — top */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700" />

                    {/* Glowing orb */}
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

                    {/* Content */}
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-16 w-full">

                        {/* Main heading */}
                        <h1 className="text-4xl sm:text-8xl lg:text-[6rem] font-black italic uppercase leading-none tracking-tighter mb-4">
                            <span className="text-white">WATCH</span>
                            <br />
                            <span className="text-blue-400">{sport?.name}</span>
                            <br />
                            <span className="text-white">{location?.title}</span>
                        </h1>

                        <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-sm mb-10">
                            Showing 12 venues with live commentary and match-day specials.
                        </p>

                        {/* Stats strip */}
                        <div className="flex flex-wrap gap-6 mb-12">
                            {[
                                { label: "Venues", value: "20+" },
                                { label: "Sports", value: "10+" },
                                { label: "Players", value: "100+" },
                            ].map((stat) => (
                                <div key={stat.label} className="flex flex-col">
                                    <span className="text-3xl font-black italic text-white leading-none">{stat.value}</span>
                                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-wrap gap-4 items-center">
                            <button
                                className={`group relative flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm transition-all transform -skew-x-6 overflow-hidden bg-white text-black hover:bg-blue-600 hover:text-white`}
                            >
                                <span className="transform skew-x-6 flex items-center gap-3">
                                    <Heart className={`w-5 h-5 transition-all group-hover:fill-white`} />
                                    Follow F1
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </button>

                            <button className="flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm border border-white/20 text-white hover:border-blue-500 hover:text-blue-400 transition-all transform -skew-x-6">
                                <span className="transform skew-x-6 flex items-center gap-3">
                                    <Bell className="w-5 h-5" />
                                    Race Alerts
                                </span>
                            </button>

                            <a
                                href="#next-races"
                                className="flex items-center gap-2 text-zinc-400 hover:text-white font-black uppercase italic tracking-wider text-sm transition-colors"
                            >
                                Next Race <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
                </section>

                {/* ─── Watch at a venue ───────────────────────────────────────────── */}
                <section id="watch-venues" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8" >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 sm:mb-12">
                            <h2 className="bg-blue-600 inline-block px-4 sm:px-6 py-1.5 rounded mb-2 sm:mb-3 text-white font-black italic uppercase text-xl sm:text-2xl">
                                Watch at a venue
                            </h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs sm:ml-4">
                                Restaurants, bars &amp; fan zones screening this race
                            </p>
                        </div>

                        {venues.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {venues.map((venue) => (
                                    <Link
                                        key={venue.id}
                                        href={`/venues/${venue.slug}`}
                                        className="group block overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 transition-all duration-300 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-950/20"
                                    >
                                        <div className="h-1 w-full bg-blue-600 transition-colors group-hover:bg-blue-500" />
                                        <div className="p-4 sm:p-5">
                                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                                <Tv className="w-4 h-4 shrink-0 text-blue-500" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                                                    Watch F1
                                                </span>
                                            </div>
                                            <h3 className="font-black italic uppercase leading-tight text-base sm:text-lg text-white mb-2 group-hover:text-blue-400 transition-colors">
                                                {venue.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold">
                                                <MapPin className="w-3 h-3 shrink-0 text-zinc-600" />
                                                <span>{location?.title}</span>
                                            </div>
                                            <div className="flex items-center justify-end pt-4 mt-4 border-t border-zinc-800">
                                                <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest transition-colors group-hover:text-blue-300 inline-flex items-center gap-0.5">
                                                    View venue <ChevronRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 sm:px-6 py-8 sm:py-10 text-center">
                                <Tv className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-500 font-bold text-sm">No watch venues for F1 in our directory yet.</p>
                                <Link
                                    href="/discover?intent=watch"
                                    className="inline-flex items-center gap-2 mt-4 text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors"
                                >
                                    Discover venues <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </div>
                </section >

                {/* ─── Follow CTA Banner ────────────────────────────────────────── */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950">
                    <div className="absolute inset-0 bg-linear-to-r from-blue-950/40 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-blue-600 via-blue-400 to-transparent" />

                    <div className="mx-auto max-w-7xl relative">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Flag className="w-6 h-6 text-blue-500" />
                                    <span className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">Never Miss a Venue</span>
                                </div>
                                <h2 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-3">
                                    Follow <span className="text-blue-500">Venues</span>
                                </h2>
                                <p className="text-zinc-500 font-bold text-sm max-w-md">
                                    Be notified when new venues are available.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 shrink-0">

                                <button className="flex items-center justify-center gap-3 px-10 py-3 font-black uppercase italic tracking-wider text-sm border border-zinc-700 text-zinc-400 hover:border-blue-600 hover:text-blue-400 transition-all transform -skew-x-6">
                                    <span className="transform skew-x-6 flex items-center gap-3">
                                        <Bell className="w-4 h-4" />
                                        Enable Venue Alerts
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}