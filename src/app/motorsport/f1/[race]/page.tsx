import { CountdownTimer } from "@/components/CountdownTimer";
import { getDiscoverVenues } from "@/data/discover";
import { formatDate, formatTime } from "@/util/formats";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import {
    Bell,
    Calendar,
    ChevronRight,
    Clock,
    Flag,
    Gauge,
    Heart,
    MapPin,
    Radio,
    Repeat,
    TrendingUp,
    Trophy,
    Tv,
    Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRaceBySlug } from "../_services/race";

const NAV_LINKS = [
    { label: "Race Info", href: "#race-info" },
    { label: "Venues", href: "#watch-venues" },
    { label: "Details", href: "#details" },
    { label: "Follow", href: "#follow" },
];

function formatDistance(km: number): string {
    return km % 1 === 0 ? `${km} km` : `${km.toFixed(3)} km`;
}

/** Base URL for canonical and Open Graph (set NEXT_PUBLIC_SITE_URL in production). */
function getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "https://leaguesports.com";
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ race: string }>;
}): Promise<Metadata> {
    const { race: slug } = await params;
    const raceDetails = await getRaceBySlug(slug);
    if (!raceDetails) return { title: "Race Not Found" };

    const dateStr = formatDate(raceDetails.dateTime);
    const description = [
        `${raceDetails.title} – ${raceDetails.track || "Formula 1"}.`,
        `Round ${raceDetails.round}, ${dateStr}.`,
        `${raceDetails.laps} laps, ${formatDistance(raceDetails.distance)}.`,
        "Find venues to watch the race and get race alerts.",
    ].join(" ");

    const title = `${raceDetails.title} | F1`;
    const canonicalPath = `/motorsport/f1/${slug}`;
    const baseUrl = getBaseUrl();
    const canonicalUrl = `${baseUrl}${canonicalPath}`;

    return {
        title,
        description,
        keywords: [
            "Formula 1",
            "F1",
            raceDetails.title,
            raceDetails.track ?? "Grand Prix",
            "motor racing",
            "watch F1",
            "race schedule",
        ],
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: "LeagueSports",
            type: "website",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
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

const components: PortableTextComponents = {
    block: {
        // This maps the "normal" style in your JSON to a styled <p> tag
        normal: ({ children }) => <p className="mb-4 leading-relaxed text-zinc-500 font-bold uppercase tracking-widest text-sm sm:ml-4">{children}</p>,
        h1: ({ children }) => <h1 className="text-4xl font-bold mb-6 text-red-500">{children}</h1>,
    },
    marks: {
        // If you add links later, this handles them
        link: ({ children, value }) => (
            <Link href={value.href} className="text-blue-600 hover:underline">
                {children}
            </Link>
        ),
    },
}

export default async function F1RacePage({ params }: { params: Promise<{ race: string }> }) {
    const { race } = await params;

    const raceDetails = await getRaceBySlug(race);

    if (!raceDetails) return notFound();

    const raceDate = new Date(raceDetails.dateTime);
    const isPast = raceDate.getTime() < new Date().getTime();
    const distanceStr = formatDistance(raceDetails.distance);
    const roundLabel = `Round ${raceDetails.round}`;
    const watchVenues = getDiscoverVenues("watch", undefined, undefined, ["f1"], undefined);

    const baseUrl = getBaseUrl();
    const racePath = `/motorsport/f1/${race}`;

    const breadcrumbListJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
            { "@type": "ListItem", position: 2, name: "Motorsport", item: `${baseUrl}/motorsport` },
            { "@type": "ListItem", position: 3, name: "F1", item: `${baseUrl}/motorsport/f1` },
            { "@type": "ListItem", position: 4, name: raceDetails.title, item: `${baseUrl}${racePath}` },
        ],
    };

    const eventJsonLd = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: raceDetails.title,
        startDate: new Date(raceDetails.dateTime).toISOString(),
        description: `${raceDetails.title} – ${raceDetails.track || "Formula 1"}. Round ${raceDetails.round}. ${raceDetails.laps} laps, ${distanceStr}. Find venues to watch the race.`,
        location: {
            "@type": "Place",
            name: raceDetails.track ?? "Formula 1 circuit",
        },
        organizer: {
            "@type": "Organization",
            name: "LeagueSports",
            url: baseUrl,
        },
        sport: "Formula 1",
        url: `${baseUrl}${racePath}`,
    };

    const breadcrumbs: { label: string; href: string }[] = [
        { label: "Home", href: "/" },
        { label: "Motorsport", href: "/motorsport" },
        { label: "F1", href: "/motorsport/f1" },
        { label: raceDetails.title, href: racePath },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">

            {/* ─── JSON-LD structured data ─────────────────────────────────── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [breadcrumbListJsonLd, eventJsonLd] }),
                }}
            />

            {/* ─── In-page nav ─────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 sm:py-3">
                        <div className="flex items-center gap-2 mr-4 sm:mr-6 shrink-0">
                            <Link
                                href="/motorsport/f1"
                                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <span className="bg-red-600 px-2.5 sm:px-3 py-1 rounded text-xs font-black uppercase tracking-widest text-white">
                                    F1
                                </span>
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest hidden sm:block">
                                    Formula 1
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-0.5 sm:gap-1 flex-1 min-w-0">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="px-2.5 sm:px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0 rounded"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        <button
                            className="ml-auto shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-colors bg-white/10 text-white hover:bg-red-600 rounded"
                        >
                            <Heart className="w-3.5 h-3.5 shrink-0" />
                            Follow
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Breadcrumbs ──────────────────────────────────────────────── */}
            <nav aria-label="Breadcrumb" className="border-b border-white/5 bg-[#0a0a0a]/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
                    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400" itemScope itemType="https://schema.org/BreadcrumbList">
                        {breadcrumbs.map((item, i) => (
                            <li key={item.href} className="flex items-center gap-x-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />}
                                {i === breadcrumbs.length - 1 ? (
                                    <span itemProp="name" className="font-medium text-white">
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link href={item.href} itemProp="item" className="hover:text-white transition-colors" itemScope itemType="https://schema.org/Thing">
                                        <span itemProp="name">{item.label}</span>
                                    </Link>
                                )}
                                <meta itemProp="position" content={String(i + 1)} />
                            </li>
                        ))}
                    </ol>
                </div>
            </nav>

            {/* ─── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden min-h-[50vh] sm:min-h-[80vh] lg:min-h-[88vh] flex items-start sm:items-end">
                <div className="absolute inset-0 bg-linear-to-br from-red-950/50 via-[#0a0a0a]  to-[#0a0a0a]" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-px bg-linear-to-r from-transparent via-red-600/25 to-transparent"
                            style={{
                                top: `${8 + i * 7}%`,
                                left: "-10%",
                                right: "-10%",
                                transform: `skewY(-${0.5 + i * 0.4}deg)`,
                                opacity: 0.35 - i * 0.02,
                            }}
                        />
                    ))}
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                    <span
                        className="text-[18vw] sm:text-[20vw] font-black italic uppercase text-white/3 leading-none tracking-tighter"
                        style={{ fontStretch: "condensed" }}
                    >
                        {raceDetails.title?.split(" ").pop() ?? "GP"}
                    </span>
                </div>

                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-700 via-red-500 to-red-700" />
                <div className="absolute top-1/4 right-1/4 w-64 sm:w-md h-64 sm:h-112 bg-red-600/8 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
                <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-linear-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-24 pt-10 sm:pt-20 w-full">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                        {roundLabel && (
                            <span className="bg-red-600 px-3 sm:px-4 py-1.5 rounded text-xs font-black uppercase tracking-[0.2em] text-white">
                                {roundLabel}
                            </span>
                        )}
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isPast ? "bg-zinc-500" : "bg-emerald-500 animate-pulse"}`} />
                            <span className={`text-xs font-black uppercase tracking-widest ${isPast ? "text-zinc-500" : "text-emerald-400"}`}>
                                {isPast ? "Completed" : "Upcoming"}
                            </span>
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[7rem] font-black italic uppercase leading-[0.95] tracking-tighter mb-3 sm:mb-4 max-w-4xl">
                        <span className="text-white">{raceDetails.title}</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
                        <div className="flex items-center gap-2 text-white">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-red-500/90" />
                            <span className="font-bold text-sm sm:text-base">{formatDate(raceDetails.dateTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-red-500/90" />
                            <span className="font-bold text-sm sm:text-base">{formatTime(raceDetails.dateTime)}</span>
                        </div>
                    </div>

                    {!isPast && (
                        <div className="mb-8 sm:mb-10">
                            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2 sm:mb-3">Time until race</p>
                            <CountdownTimer
                                targetDate={raceDetails.dateTime}
                                completedLabel="Race in progress"
                                className="justify-start"
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                        <button className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 font-black uppercase italic tracking-wider text-xs sm:text-sm transition-colors overflow-hidden bg-white text-black hover:bg-red-600 hover:text-white rounded">
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-all group-hover:fill-white" />
                            Follow this race
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                        </button>
                        <button className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 font-black uppercase italic tracking-wider text-xs sm:text-sm border border-white/20 text-white hover:border-red-500 hover:text-red-400 transition-colors rounded">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                            Race alerts
                        </button>
                        <Link
                            href="/motorsport/f1/calendar"
                            className="flex items-center gap-2 text-zinc-400 hover:text-white font-black uppercase italic tracking-wider text-xs sm:text-sm transition-colors"
                        >
                            Full calendar <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Race Info ────────────────────────────────────────────────── */}
            <section id="race-info" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 sm:mb-12">
                        <h2 className="bg-red-600 inline-block px-4 sm:px-6 py-1.5 rounded mb-2 sm:mb-3 text-white font-black italic uppercase text-xl sm:text-2xl">
                            Race details
                        </h2>
                        <PortableText value={raceDetails.description} components={components} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            {
                                icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
                                label: "Date & time",
                                value: `${formatDate(raceDetails.dateTime)} · ${formatTime(raceDetails.dateTime)}`,
                            },
                            {
                                icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
                                label: "Circuit",
                                value: raceDetails.track ?? "—",
                            },
                            {
                                icon: <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />,
                                label: "Laps",
                                value: String(raceDetails.laps),
                            },
                            {
                                icon: <Gauge className="w-5 h-5 sm:w-6 sm:h-6" />,
                                label: "Distance",
                                value: distanceStr,
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/2 p-4 sm:p-6 hover:border-red-600/30 hover:bg-white/4 transition-all duration-300"
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="text-red-500/90 shrink-0">{item.icon}</div>
                                    <div className="min-w-0">
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">
                                            {item.label}
                                        </p>
                                        <p className="text-white font-bold text-sm sm:text-base leading-snug">{item.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ─── F1 by the numbers ────────────────────────────────────────── */}
            < section id="details" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden" >
                <div className="absolute inset-0 bg-red-600/5 pointer-events-none" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-px bg-linear-to-r from-transparent via-red-600/20 to-transparent"
                            style={{ top: `${20 + i * 15}%`, left: "-10%", right: "-10%", transform: "skewY(-2deg)" }}
                        />
                    ))}
                </div>

                <div className="mx-auto max-w-7xl relative">
                    <div className="mb-6 sm:mb-10">
                        <h2 className="text-xl sm:text-2xl font-black italic uppercase text-white">F1 by the numbers</h2>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                            The science of speed
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />, value: "375 km/h", label: "Top speed" },
                            { icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />, value: "1.6s", label: "0–100 km/h" },
                            { icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />, value: "5G", label: "Cornering force" },
                            { icon: <Radio className="w-5 h-5 sm:w-6 sm:h-6" />, value: "1000+", label: "Sensors per car" },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-950/90 p-4 sm:p-6 hover:border-red-600/50 transition-colors">
                                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                                    <div className="text-red-500">{stat.icon}</div>
                                    <div>
                                        <p className="text-white text-lg sm:text-2xl font-black italic leading-none">{stat.value}</p>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ─── Watch at a venue ───────────────────────────────────────────── */}
            < section id="watch-venues" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8" >
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 sm:mb-12">
                        <h2 className="bg-red-600 inline-block px-4 sm:px-6 py-1.5 rounded mb-2 sm:mb-3 text-white font-black italic uppercase text-xl sm:text-2xl">
                            Watch at a venue
                        </h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs sm:ml-4">
                            Restaurants, bars &amp; fan zones screening this race
                        </p>
                    </div>

                    {watchVenues.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {watchVenues.map((venue) => (
                                <Link
                                    key={venue.id}
                                    href={`/venues/${venue.slug}`}
                                    className="group block overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 transition-all duration-300 hover:border-red-600/50 hover:shadow-lg hover:shadow-red-950/20"
                                >
                                    <div className="h-1 w-full bg-red-600 transition-colors group-hover:bg-red-500" />
                                    <div className="p-4 sm:p-5">
                                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                            <Tv className="w-4 h-4 shrink-0 text-red-500" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                                                Watch F1
                                            </span>
                                        </div>
                                        <h3 className="font-black italic uppercase leading-tight text-base sm:text-lg text-white mb-2 group-hover:text-red-400 transition-colors">
                                            {venue.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold">
                                            <MapPin className="w-3 h-3 shrink-0 text-zinc-600" />
                                            <span>{venue.area}</span>
                                        </div>
                                        <div className="flex items-center justify-end pt-4 mt-4 border-t border-zinc-800">
                                            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors group-hover:text-red-300 inline-flex items-center gap-0.5">
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
                                className="inline-flex items-center gap-2 mt-4 text-red-400 text-xs font-black uppercase tracking-widest hover:text-red-300 transition-colors"
                            >
                                Discover venues <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    )}
                </div>
            </section >

            {/* ─── Follow CTA ────────────────────────────────────────────────── */}
            < section id="follow" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950/80" >
                <div className="absolute inset-0 bg-linear-to-r from-red-950/40 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-red-600 via-red-400 to-transparent" />

                <div className="mx-auto max-w-7xl relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <Flag className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-red-500" />
                                <span className="text-red-400 text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                                    Never miss a race
                                </span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-2 sm:mb-3">
                                Follow <span className="text-red-500">F1</span>
                            </h2>
                            <p className="text-zinc-500 font-bold text-xs sm:text-sm max-w-md">
                                Get race alerts, live standings updates, and breaking paddock news delivered straight to
                                you.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 w-full sm:w-auto sm:shrink-0">
                            <button className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 font-black uppercase italic tracking-wider text-sm sm:text-base transition-colors overflow-hidden bg-white text-black hover:bg-red-600 hover:text-white rounded">
                                <Heart className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:fill-white transition-all" />
                                Follow F1
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 font-black uppercase italic tracking-wider text-xs sm:text-sm border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-red-400 transition-colors rounded">
                                <Bell className="w-4 h-4 shrink-0" />
                                Enable race alerts
                            </button>
                        </div>
                    </div>
                </div>
            </section >
        </div >
    );
}
