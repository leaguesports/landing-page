import { Bell, ChevronRight, Heart } from "lucide-react";

type WatchHeroProps = {
    sportName: string;
    locationTitle: string;
    venueCount: number;
};

export function WatchHero({ sportName, locationTitle, venueCount }: WatchHeroProps) {
    return (
        <section className="relative overflow-hidden min-h-[85vh] flex items-end">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-[#0f0f0f] to-[#0f0f0f]" />

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

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span
                    className="text-[28vw] font-black italic uppercase text-white/[0.02] leading-none tracking-tighter"
                    style={{ fontStretch: "condensed" }}
                >
                    Watch
                </span>
            </div>

            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700" />

            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-16 w-full">
                <h1 className="text-4xl sm:text-8xl lg:text-[6rem] font-black italic uppercase leading-none tracking-tighter mb-4">
                    <span className="text-white">WATCH</span>
                    <br />
                    <span className="text-blue-400">{sportName}</span>
                    <br />
                    <span className="text-white">{locationTitle}</span>
                </h1>

                <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-sm mb-10">
                    Showing {venueCount} venues with live commentary and match-day specials.
                </p>

                <div className="flex flex-wrap gap-6 mb-12">
                    {[
                        { label: "Fans", value: "100+" },
                        { label: "Venues", value: venueCount },
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col">
                            <span className="text-3xl font-black italic text-white leading-none">{stat.value}</span>
                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        type="button"
                        className="group relative flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm transition-all transform -skew-x-6 overflow-hidden bg-white text-black hover:bg-blue-600 hover:text-white"
                    >
                        <span className="transform skew-x-6 flex items-center gap-3">
                            <Heart className="w-5 h-5 transition-all group-hover:fill-white" />
                            Follow {sportName}
                        </span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </button>

                    <button
                        type="button"
                        className="flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm border border-white/20 text-white hover:border-blue-500 hover:text-blue-400 transition-all transform -skew-x-6"
                    >
                        <span className="transform skew-x-6 flex items-center gap-3">
                            <Bell className="w-5 h-5" />
                            Game Alerts
                        </span>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
        </section>
    );
}
