import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getRaceBySlug } from "../_services/race";
import { formatDate, formatTime } from "@/util/formats";
import { CountdownTimer } from "@/components/CountdownTimer";
import { getDiscoverVenues } from "@/data/discover";
import {
    Bell,
    Calendar,
    ChevronRight,
    Flag,
    Heart,
    MapPin,
    Radio,
    Trophy,
    Tv,
    Zap,
    Gauge,
    Repeat,
    Clock,
    TrendingUp,
} from "lucide-react";

const NAV_LINKS = [
    { label: "Race Info", href: "#race-info" },
    { label: "Venues", href: "#watch-venues" },
    { label: "Details", href: "#details" },
    { label: "Follow", href: "#follow" },
];

function formatDistance(km: number): string {
    return km % 1 === 0 ? `${km} km` : `${km.toFixed(3)} km`;
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

    return {
        title: `${raceDetails.title} | F1`,
        description,
    };
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

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">

            {/* ─── In-page nav ─────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
                        <div className="flex items-center gap-2 mr-6 shrink-0">
                            <Link
                                href="/motorsport/f1"
                                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <div className="bg-red-600 px-3 py-1 transform -skew-x-6">
                                    <span className="transform skew-x-6 block text-xs font-black uppercase tracking-widest text-white">
                                        F1
                                    </span>
                                </div>
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest hidden sm:block">
                                    Formula 1
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-1 flex-1">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0 transform -skew-x-6 rounded-sm"
                                >
                                    <span className="transform skew-x-6 block">{link.label}</span>
                                </a>
                            ))}
                        </div>

                        <button
                            className="ml-auto shrink-0 flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all transform -skew-x-6 bg-white/10 text-white hover:bg-red-600 rounded-sm"
                        >
                            <span className="transform skew-x-6 flex items-center gap-2">
                                <Heart className="w-3.5 h-3.5" />
                                Follow
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden min-h-[88vh] flex items-end">
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
                        className="text-[20vw] font-black italic uppercase text-white/3 leading-none tracking-tighter"
                        style={{ fontStretch: "condensed" }}
                    >
                        {raceDetails.title?.split(" ").pop() ?? "GP"}
                    </span>
                </div>

                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-700 via-red-500 to-red-700" />
                <div className="absolute top-1/4 right-1/4 w-[28rem] h-[28rem] bg-red-600/8 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 pt-20 w-full">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        {roundLabel && (
                            <div className="bg-red-600 px-4 py-1.5 transform -skew-x-6 rounded-sm">
                                <span className="transform skew-x-6 block text-xs font-black uppercase tracking-[0.2em] text-white">
                                    {roundLabel}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${isPast ? "bg-zinc-500" : "bg-emerald-500 animate-pulse"}`} />
                            <span className={`text-xs font-black uppercase tracking-widest ${isPast ? "text-zinc-500" : "text-emerald-400"}`}>
                                {isPast ? "Completed" : "Upcoming"}
                            </span>
                        </div>
                    </div>

                    <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-[7rem] font-black italic uppercase leading-[0.95] tracking-tighter mb-4 max-w-4xl">
                        <span className="text-white">{raceDetails.title}</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 mb-10">
                        <div className="flex items-center gap-2 text-white">
                            <Calendar className="w-5 h-5 text-red-500/90" />
                            <span className="font-bold">{formatDate(raceDetails.dateTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <Clock className="w-5 h-5 text-red-500/90" />
                            <span className="font-bold">{formatTime(raceDetails.dateTime)}</span>
                        </div>
                    </div>

                    {!isPast && (
                        <div className="mb-10">
                            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-3">Time until race</p>
                            <CountdownTimer
                                targetDate={raceDetails.dateTime}
                                completedLabel="Race in progress"
                                className="justify-start"
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 items-center">
                        <button className="group relative flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm transition-all transform -skew-x-6 overflow-hidden bg-white text-black hover:bg-red-600 hover:text-white rounded-sm">
                            <span className="transform skew-x-6 flex items-center gap-3">
                                <Heart className="w-5 h-5 transition-all group-hover:fill-white" />
                                Follow this race
                            </span>
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                        </button>
                        <button className="flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm border border-white/20 text-white hover:border-red-500 hover:text-red-400 transition-all transform -skew-x-6 rounded-sm">
                            <span className="transform skew-x-6 flex items-center gap-3">
                                <Bell className="w-5 h-5" />
                                Race alerts
                            </span>
                        </button>
                        <Link
                            href="/motorsport/f1/calendar"
                            className="flex items-center gap-2 text-zinc-400 hover:text-white font-black uppercase italic tracking-wider text-sm transition-colors"
                        >
                            Full calendar <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Race Info ────────────────────────────────────────────────── */}
            <section id="race-info" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12">
                        <div className="bg-red-600 inline-block px-6 py-1.5 transform -skew-x-6 rounded-sm mb-3">
                            <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
                                Race details
                            </h2>
                        </div>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs ml-4">
                            {raceDetails.title} · {raceDetails.track ?? "Circuit"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                icon: <Calendar className="w-6 h-6" />,
                                label: "Date & time",
                                value: `${formatDate(raceDetails.dateTime)} · ${formatTime(raceDetails.dateTime)}`,
                            },
                            {
                                icon: <MapPin className="w-6 h-6" />,
                                label: "Circuit",
                                value: raceDetails.track ?? "—",
                            },
                            {
                                icon: <Repeat className="w-6 h-6" />,
                                label: "Laps",
                                value: String(raceDetails.laps),
                            },
                            {
                                icon: <Gauge className="w-6 h-6" />,
                                label: "Distance",
                                value: distanceStr,
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/2 p-6 hover:border-red-600/30 hover:bg-white/4 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-red-500/90 shrink-0">{item.icon}</div>
                                    <div className="min-w-0">
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">
                                            {item.label}
                                        </p>
                                        <p className="text-white font-bold leading-snug">{item.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── F1 by the numbers ────────────────────────────────────────── */}
            <section id="details" className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
                    <div className="mb-10">
                        <h2 className="text-2xl font-black italic uppercase text-white">F1 by the numbers</h2>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                            The science of speed
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { icon: <Zap className="w-6 h-6" />, value: "375 km/h", label: "Top speed" },
                            { icon: <TrendingUp className="w-6 h-6" />, value: "1.6s", label: "0–100 km/h" },
                            { icon: <Trophy className="w-6 h-6" />, value: "5G", label: "Cornering force" },
                            { icon: <Radio className="w-6 h-6" />, value: "1000+", label: "Sensors per car" },
                        ].map((stat) => (
                            <div key={stat.label} className="group relative">
                                <div className="absolute inset-0 bg-red-600/80 transform -skew-x-6 translate-x-1 translate-y-1 rounded transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
                                <div className="relative bg-zinc-950/90 border border-zinc-800 p-6 transform -skew-x-6 hover:border-red-600/50 transition-all rounded overflow-hidden">
                                    <div className="transform skew-x-6 flex flex-col items-center text-center gap-3">
                                        <div className="text-red-500">{stat.icon}</div>
                                        <div>
                                            <p className="text-white text-2xl font-black italic leading-none">{stat.value}</p>
                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                                {stat.label}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Watch at a venue ───────────────────────────────────────────── */}
            <section id="watch-venues" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12">
                        <div className="bg-red-600 inline-block px-6 py-1.5 transform -skew-x-6 rounded-sm mb-3">
                            <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
                                Watch at a venue
                            </h2>
                        </div>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs ml-4">
                            Bars &amp; fan zones screening this race
                        </p>
                    </div>

                    {watchVenues.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {watchVenues.map((venue) => (
                                <Link
                                    key={venue.id}
                                    href={`/venues/${venue.slug}`}
                                    className="group relative block transition-all duration-300"
                                >
                                    <div className="absolute inset-0 bg-red-600/30 transform -skew-x-6 translate-x-2 translate-y-2 rounded transition-transform group-hover:translate-x-3 group-hover:translate-y-3" />
                                    <div className="relative bg-zinc-950 border border-zinc-800 transform -skew-x-6 overflow-hidden group-hover:border-red-600/50 transition-colors rounded">
                                        <div className="h-1 w-full bg-red-600 group-hover:bg-red-500 transition-colors" />
                                        <div className="transform skew-x-6 p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Tv className="w-4 h-4 text-red-500" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                                                    Watch F1
                                                </span>
                                            </div>
                                            <h3 className="font-black italic uppercase leading-tight text-lg text-white mb-2 group-hover:text-red-400 transition-colors">
                                                {venue.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold">
                                                <MapPin className="w-3 h-3 shrink-0 text-zinc-600" />
                                                <span>{venue.area}</span>
                                            </div>
                                            <div className="flex items-center justify-end pt-4 mt-4 border-t border-zinc-800">
                                                <span className="text-red-400 text-[10px] font-black uppercase tracking-widest group-hover:text-red-300 transition-colors">
                                                    View venue <ChevronRight className="w-3 h-3 inline" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-6 py-10 text-center">
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
            </section>

            {/* ─── Follow CTA ────────────────────────────────────────────────── */}
            <section id="follow" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950/80">
                <div className="absolute inset-0 bg-linear-to-r from-red-950/40 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-red-600 via-red-400 to-transparent" />

                <div className="mx-auto max-w-7xl relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Flag className="w-6 h-6 text-red-500" />
                                <span className="text-red-400 text-xs font-black uppercase tracking-[0.3em]">
                                    Never miss a race
                                </span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-3">
                                Follow <span className="text-red-500">F1</span>
                            </h2>
                            <p className="text-zinc-500 font-bold text-sm max-w-md">
                                Get race alerts, live standings updates, and breaking paddock news delivered straight to
                                you.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 shrink-0">
                            <button className="group relative flex items-center gap-3 px-10 py-5 font-black uppercase italic tracking-wider text-base transition-all transform -skew-x-6 overflow-hidden bg-white text-black hover:bg-red-600 hover:text-white rounded-sm">
                                <span className="transform skew-x-6 flex items-center gap-3">
                                    <Heart className="w-5 h-5 group-hover:fill-white transition-all" />
                                    Follow F1
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                            </button>
                            <button className="flex items-center justify-center gap-3 px-10 py-3 font-black uppercase italic tracking-wider text-sm border border-zinc-700 text-zinc-400 hover:border-red-600 hover:text-red-400 transition-all transform -skew-x-6 rounded-sm">
                                <span className="transform skew-x-6 flex items-center gap-3">
                                    <Bell className="w-4 h-4" />
                                    Enable race alerts
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
