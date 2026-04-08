import { ChevronRight, MapPin, Tv } from "lucide-react";
import Link from "next/link";
import type { WatchVenue } from "../watch-types";

type WatchVenuesSectionProps = {
    venues: WatchVenue[];
    locationTitle: string;
    sportName: string;
};

export function WatchVenuesSection({
    venues,
    locationTitle,
    sportName,
}: WatchVenuesSectionProps) {
    return (
        <section
            id="venues"
            className="border-t border-white/5 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-7xl w-full">
                <header className="mb-8 sm:mb-10 lg:mb-12 max-w-3xl">
                    <p className="text-blue-400 text-xs font-black uppercase tracking-[0.28em] mb-3">
                        Venues
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white">
                        Watch at a venue
                    </h2>
                    <p className="mt-3 text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-widest leading-relaxed">
                        Restaurants, bars &amp; fan zones screening live sport
                    </p>
                </header>

                {venues.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                        {venues.map((venue) => (
                            <Link
                                key={venue.id}
                                href={`/venues/${venue.slug}`}
                                className="group block overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/90 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/25"
                            >
                                <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600 transition-opacity group-hover:opacity-100 opacity-90" />
                                <div className="p-4 sm:p-5">
                                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                        <Tv className="w-4 h-4 shrink-0 text-blue-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                                            Watch {sportName}
                                        </span>
                                    </div>
                                    <h3 className="font-black italic uppercase leading-tight text-base sm:text-lg text-white mb-2 group-hover:text-blue-400 transition-colors">
                                        {venue.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold">
                                        <MapPin className="w-3 h-3 shrink-0 text-zinc-600" />
                                        <span>{locationTitle}</span>
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
                    <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/60 px-4 sm:px-6 py-10 sm:py-12 text-center">
                        <Tv className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500 font-bold text-sm">
                            No watch venues for {sportName} in our directory yet.
                        </p>
                        <Link
                            href="/discover?intent=watch"
                            className="inline-flex items-center gap-2 mt-4 text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors"
                        >
                            Discover venues <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
