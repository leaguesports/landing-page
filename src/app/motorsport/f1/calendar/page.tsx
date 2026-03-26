import { formatDate, formatTime } from "@/util/formats";
import { Calendar, ChevronRight, Clock, Flag, MapPin } from "lucide-react";
import Link from "next/link";
import { getRaces } from "../../_actions";

function formatDistance(km: number): string {
    return km % 1 === 0 ? `${km} km` : `${km.toFixed(3)} km`;
}

export default async function F1CalendarPage() {
    const races = await getRaces("f1", 30);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            {/* ─── In-page nav ─────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
                        <div className="flex items-center gap-2 mr-6 shrink-0">
                            <div className="bg-red-600 px-3 py-1 transform -skew-x-6">
                                <span className="transform skew-x-6 block text-xs font-black uppercase tracking-widest text-white">
                                    F1
                                </span>
                            </div>
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest hidden sm:block">
                                Formula 1
                            </span>
                        </div>

                        <Link
                            href="/motorsport/f1"
                            className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0 transform -skew-x-6"
                        >
                            <span className="transform skew-x-6 block">Next Races</span>
                        </Link>
                        <div className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white bg-white/10 shrink-0 transform -skew-x-6">
                            <span className="transform skew-x-6 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                Calendar
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ─── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 bg-linear-to-br from-red-950/40 via-[#0f0f0f] to-[#0f0f0f]" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-700 via-red-500 to-red-700" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-px bg-linear-to-r from-transparent via-red-600/20 to-transparent"
                            style={{
                                top: `${15 + i * 18}%`,
                                left: "-10%",
                                right: "-10%",
                                transform: `skewY(-${1 + i * 0.3}deg)`,
                                opacity: 0.35 - i * 0.05,
                            }}
                        />
                    ))}
                </div>

                <div className="relative mx-auto max-w-7xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-red-600 px-4 py-1.5 transform -skew-x-6">
                            <span className="transform skew-x-6 block text-xs font-black uppercase tracking-[0.2em] text-white">
                                2025 Season
                            </span>
                        </div>
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black italic uppercase leading-none tracking-tighter mb-2">
                        <span className="text-white">SEASON</span>{" "}
                        <span className="text-red-500">CALENDAR</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-sm">
                        2025 FIA Formula One World Championship · {races.length} races
                    </p>
                </div>
            </section>

            {/* ─── All Races ────────────────────────────────────────────────── */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 pb-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <div className="bg-red-600 inline-block px-6 py-1.5 transform -skew-x-6 mb-2">
                            <h2 className="text-white font-black italic uppercase text-xl transform skew-x-6">
                                All Races
                            </h2>
                        </div>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs ml-4">
                            Chronological order
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {races.map((race, index) => (
                            <Link
                                href={`/motorsport/f1/${race.slug}`}
                                key={race.id}
                                className="group relative cursor-pointer transition-all duration-300"
                            >
                                <div className="absolute inset-0 transform -skew-x-3 translate-x-1.5 translate-y-1.5 transition-transform group-hover:translate-x-2.5 group-hover:translate-y-2.5 bg-zinc-700" />
                                <div className="relative bg-zinc-950 border transform -skew-x-3 overflow-hidden border-zinc-800 group-hover:border-red-600/40 transition-colors">
                                    <div className="h-1 w-full bg-zinc-700 group-hover:bg-red-600/80 transition-colors" />
                                    <div className="transform skew-x-3 p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                                Round {race.round ?? index + 1}
                                            </span>
                                            <span className="text-xl opacity-70">
                                                <Flag className="w-4 h-4" />
                                            </span>
                                        </div>
                                        <h3 className="font-black italic uppercase leading-tight mb-1 text-white group-hover:text-red-400 transition-colors">
                                            {race.title}
                                        </h3>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4">
                                            {race.track ?? race.title}
                                        </p>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                                                <Calendar className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                <span>{formatDate(race.dateTime)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                                                <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                <span>{formatTime(race.dateTime)}</span>
                                            </div>
                                            {race.track && (
                                                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                                                    <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                    <span>{race.track}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-4 pt-3 border-t border-zinc-800 items-end">
                                            {race.laps != null && (
                                                <div>
                                                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                                                        Laps
                                                    </p>
                                                    <p className="text-white font-black italic text-base leading-none">
                                                        {race.laps}
                                                    </p>
                                                </div>
                                            )}
                                            {race.distance != null && (
                                                <div>
                                                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                                                        Distance
                                                    </p>
                                                    <p className="text-white font-black italic text-base leading-none">
                                                        {formatDistance(race.distance)}
                                                    </p>
                                                </div>
                                            )}
                                            <span className="ml-auto flex items-center gap-1 text-xs font-black uppercase italic text-red-500 group-hover:text-red-400 transition-colors">
                                                Details
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {races.length === 0 && (
                        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg">
                            <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                                No races in calendar
                            </p>
                            <p className="text-zinc-600 text-xs mt-1">
                                Season schedule will appear here when available.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
