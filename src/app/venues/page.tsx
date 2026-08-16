/* eslint-disable @next/next/no-img-element */
import {
    VenueContactActions,
    VenueUtilityBadges,
} from "@/components/VenueUtilityBadges";
import { urlFor } from "@/sanity/client";
import { listVenues, Venue } from "@/services/venues";
import { Bell, ChevronRight, Flag, MapPin } from "lucide-react";
import Link from "next/link";

function getVenueImageSrc(venue: Venue) {
    if (venue.broadcasts && venue.broadcasts.length) {
        return "https://images.unsplash.com/photo-1775642679594-89bb4b78e26e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }

    if (venue.sports && venue.sports.length > 0 && venue.sports[0].image) {
        return urlFor(venue.sports[0].image)!.url();
    }

    return "https://blocks.astratic.com/img/general-img-landscape.png";
}

function VenueImage({ venue }: { venue: Venue }) {
    const imageSrc = getVenueImageSrc(venue);

    return (
        <img className="w-full h-48 object-cover" src={imageSrc} alt="" />
    );
}

function VenueCard({ venue }: { venue: Venue }) {
    return (
        <div className="group overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/90 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/25">
            <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600 transition-opacity group-hover:opacity-100 opacity-90" />
            <Link href={`/venues/${venue.slug}`} className="block">
                <div className="relative">
                    <VenueImage venue={venue} />
                    {venue.has_generator_backup && (
                        <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-sm">
                            ⚡ Backup Power
                        </div>
                    )}
                </div>
                <div className="p-4 sm:p-5 pb-2">
                    <h3 className="font-black italic uppercase leading-tight text-base sm:text-lg text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {venue.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold mb-3">
                        <MapPin className="w-3 h-3 shrink-0 text-zinc-600" />
                        <span>{venue.address.suburb}</span>
                    </div>
                    <VenueUtilityBadges venue={venue} className="mb-2" />
                </div>
            </Link>
            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <VenueContactActions venue={venue} />
            </div>
        </div>
    );
}

export default async function WatchPage() {
    const venues = await listVenues();

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
                                    Venues
                                </span>
                            </div>

                            <div className="flex items-center gap-1 flex-1">
                                <Link href="/venues" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0 transform -skew-x-6">
                                    <span className="transform skew-x-6 block">
                                        Venues
                                    </span>
                                </Link>
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
                            Venues
                        </span>
                    </div>

                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-700 via-red-500 to-red-700" />

                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-12 sm:pt-16 w-full">
                        <div className="mb-6">
                        </div>

                        <h1 className="text-4xl sm:text-7xl lg:text-[5rem] font-black italic uppercase leading-[0.95] tracking-tighter mb-4">
                            <span className="text-red-white">Venues</span>
                        </h1>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
                </section>


                {/* Venues */}
                <section
                    id="venues"
                    className="scroll-mt-24 border-t border-white/5 py-12 sm:py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <header className="mb-8 sm:mb-10">
                            <h2 className="mb-2 inline-block rounded bg-red-600 px-4 py-1.5 font-black text-xl uppercase italic text-white sm:px-6 sm:text-2xl">
                                Venues
                            </h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                Venues
                            </p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {venues.map((venue) => (
                                <VenueCard key={venue._id} venue={venue} />
                            ))}
                        </div>
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

                        <div className="grid gap-8 sm:grid-cols-2">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 mb-4">
                                    Watch
                                </h3>
                                <ul className="flex flex-wrap gap-2">
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 mb-4">
                                    Play
                                </h3>
                                <ul className="flex flex-wrap gap-2">
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
                        </div>
                        <div className="flex flex-wrap gap-2">
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
