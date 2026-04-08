import { ChevronRight, MapPin, Trophy, Tv } from "lucide-react";
import Link from "next/link";
import type { PlayVenue } from "../types";

type PlayVenueSectionProps = {
    venues: PlayVenue[];
    locationTitle: string;
    sportName: string;
};

export function PlayVenueSection({
    venues,
    locationTitle,
    sportName,
}: PlayVenueSectionProps) {
    return (
        <section id="venues" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-12 sm:pt-16 w-full">
                <div className="mb-8 sm:mb-12">
                    <h2 className="bg-green-600 inline-block px-4 sm:px-6 py-1.5 rounded mb-2 sm:mb-3 text-white font-black italic uppercase text-xl sm:text-2xl">
                        Play at a venue
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs sm:ml-4">
                        Venues playing this sport
                    </p>
                </div>

                {venues.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {venues.map((venue) => (
                            <Link
                                key={venue.id}
                                href={`/venues/${venue.slug}`}
                                className="group block overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 transition-all duration-300 hover:border-green-600/50 hover:shadow-lg hover:shadow-green-950/20"
                            >
                                <div className="h-1 w-full bg-green-600 transition-colors group-hover:bg-green-500" />
                                <div className="p-4 sm:p-5">
                                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                        <Trophy className="w-4 h-4 shrink-0 text-green-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">
                                            Play {sportName}
                                        </span>
                                    </div>
                                    <h3 className="font-black italic uppercase leading-tight text-base sm:text-lg text-white mb-2 group-hover:text-green-400 transition-colors">
                                        {venue.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold">
                                        <MapPin className="w-3 h-3 shrink-0 text-zinc-600" />
                                        <span>{locationTitle}</span>
                                    </div>
                                    <div className="flex items-center justify-end pt-4 mt-4 border-t border-zinc-800">
                                        <span className="text-green-400 text-[10px] font-black uppercase tracking-widest transition-colors group-hover:text-green-300 inline-flex items-center gap-0.5">
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
                        <p className="text-zinc-500 font-bold text-sm">
                            No play venues for {sportName} in our directory yet.
                        </p>
                        <Link
                            href="/discover?intent=play"
                            className="inline-flex items-center gap-2 mt-4 text-green-400 text-xs font-black uppercase tracking-widest hover:text-green-300 transition-colors"
                        >
                            Discover venues <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
