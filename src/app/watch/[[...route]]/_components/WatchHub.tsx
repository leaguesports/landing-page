import { Tv } from "lucide-react";

type WatchHubProps = {
    /** When the user opened `/watch/[sport]` without a location segment. */
    partialSportSlug?: string;
    /** Resolved sport name for `/watch/[sport]` (optional; falls back to slug in copy). */
    sportDisplayName?: string;
};

export function WatchHub({ partialSportSlug, sportDisplayName }: WatchHubProps) {
    const sportLabel =
        sportDisplayName ??
        (partialSportSlug
            ? partialSportSlug.replace(/-/g, " ")
            : undefined);

    return (
        <section className="relative overflow-hidden min-h-[min(52vh,28rem)] sm:min-h-[56vh] flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-[#0f0f0f] to-[#0f0f0f]" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700" />
            <div className="absolute top-1/3 right-0 w-[min(28rem,70vw)] h-[min(28rem,70vw)] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute h-px bg-gradient-to-r from-transparent via-blue-600/20 to-transparent"
                        style={{
                            top: `${12 + i * 14}%`,
                            left: "-10%",
                            right: "-10%",
                            transform: `skewY(-${1 + i * 0.4}deg)`,
                            opacity: 0.35 - i * 0.04,
                        }}
                    />
                ))}
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600 p-3 rounded-lg shadow-lg shadow-blue-950/40">
                        <Tv className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <span className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">
                        Bars &amp; fan zones
                    </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic uppercase leading-[0.95] tracking-tighter text-white mb-4 max-w-4xl">
                    Find somewhere to{" "}
                    <span className="text-blue-400">watch</span>
                    {sportLabel ? (
                        <>
                            <br />
                            <span className="text-white mt-1 sm:mt-2 inline-block text-3xl sm:text-5xl lg:text-6xl">
                                {sportLabel}
                            </span>
                        </>
                    ) : null}
                </h1>

                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs sm:text-sm max-w-2xl leading-relaxed">
                    {partialSportSlug
                        ? "Pick a suburb or area below. Every listing shows venues screening this sport with live screens."
                        : "Start with a sport or series, then choose an area to see bars and fan zones near you."}
                </p>

                {!partialSportSlug ? (
                    <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                        <a
                            href="#watch-sports"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 font-black uppercase italic tracking-wider text-sm bg-white text-black hover:bg-blue-600 hover:text-white transition-colors transform -skew-x-6"
                        >
                            <span className="transform skew-x-6">Choose a sport</span>
                        </a>
                        <a
                            href="#watch-series"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 font-black uppercase italic tracking-wider text-sm border border-white/20 text-white hover:border-blue-500 hover:text-blue-400 transition-colors transform -skew-x-6"
                        >
                            <span className="transform skew-x-6">Choose a series</span>
                        </a>
                    </div>
                ) : null}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
        </section>
    );
}
