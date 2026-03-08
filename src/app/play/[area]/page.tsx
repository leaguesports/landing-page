import { Bell, Contrast, Flag, Heart, LandPlot, Radio, Target, TrendingUp, Trophy, Volleyball, Zap } from "lucide-react";

const NAV_LINKS = [
    { label: "Sports", href: "#sports" },
    { label: "Venues", href: "#venues" },
    { label: "Players", href: "#players" },
];

const SPORTS = [
    { id: 'go-karting', name: "Go-Karting", icon: <Flag className="w-6 h-6 text-green-500" /> },
    { id: "golf", name: "Golf", icon: <LandPlot className="w-6 h-6 text-green-500" /> },
    { id: "tennis", name: "Tennis", icon: <Volleyball className="w-6 h-6 text-green-500" /> },
    { id: "cricket", name: "Cricket", icon: <Volleyball className="w-6 h-6 text-green-500" /> },
    { id: "darts", name: "Darts", icon: <Target className="w-6 h-6 text-green-500" /> },
    { id: "pool", name: "Pool", icon: <Contrast className="w-6 h-6 text-green-500" /> },
];

export default async function PlayAreaPage({ params }: { params: Promise<{ area: string }> }) {
    const { area } = await params;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">

            {/* ─── In-page nav ─────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
                        {/* Sport badge */}
                        <div className="flex items-center gap-2 mr-6 shrink-0">
                            <div className="bg-green-600 px-3 py-1 transform -skew-x-6">
                                <span className="transform skew-x-6 block text-xs font-black uppercase tracking-widest text-white">
                                    Play
                                </span>
                            </div>
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest hidden sm:block">
                                {area}
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

                        <button
                            className={`ml-auto shrink-0 flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all transform -skew-x-6 bg-white/10 text-white hover:bg-green-600`}
                        >
                            <span className="transform skew-x-6 flex items-center gap-2">
                                <Heart className={`w-3.5 h-3.5`} />
                                Follow
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden min-h-[85vh] flex items-end">

                {/* Background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-950/60 via-[#0f0f0f] to-[#0f0f0f]" />

                {/* Speed lines */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-px bg-gradient-to-r from-transparent via-green-600/30 to-transparent"
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
                        {area}
                    </span>
                </div>

                {/* Red accent bar — top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-700 via-green-500 to-green-700" />

                {/* Glowing orb */}
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

                {/* Content */}
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-16 w-full">

                    {/* Main heading */}
                    <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-black italic uppercase leading-none tracking-tighter mb-4">
                        <span className="text-white">Play</span>
                        <br />
                        <span className="text-green-500">{area}</span>
                        <span className="text-white">.</span>
                    </h1>

                    <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-sm mb-10 max-w-lg">
                        From karting to golf, {area} is the perfect place to play.
                    </p>

                    {/* Stats strip */}
                    <div className="flex flex-wrap gap-6 mb-12">
                        {[
                            { label: "Sports", value: "10" },
                            { label: "Venues", value: "24" },
                            { label: "Players", value: "15 000" },
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
                            className={`group relative flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm transition-all transform -skew-x-6 overflow-hidden bg-white text-black hover:bg-green-600 hover:text-white`}
                        >
                            <span className="transform skew-x-6 flex items-center gap-3">
                                <Heart className={`w-5 h-5 transition-all group-hover:fill-white`} />
                                Follow {area}
                            </span>
                            {/* Shimmer */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </button>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
            </section>

            {/* ─── Top sports ─────────────────────────────────────────────────────── */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 bg-gradient-to-r from-green-950/40 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-green-600 via-green-400 to-transparent" />

                <div className="mx-auto max-w-7xl relative">
                    <h2 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-3">
                        Top sports in {area}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                        {SPORTS.map((sport) => (
                            <div key={sport.id} className="group relative">
                                <div className="absolute inset-0 bg-green-600 transform -skew-x-6 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
                                <div className="relative bg-zinc-950 border border-zinc-800 p-6 transform -skew-x-6 hover:border-green-600/50 transition-all">
                                    <div className="transform skew-x-6 flex flex-col items-center text-center gap-3">
                                        <div className="text-green-500">{sport.icon}</div>
                                        <h3 className="text-white text-2xl font-black italic leading-none">{sport.name}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            < section id="details" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden" >
                <div className="absolute inset-0 bg-green-600/5 pointer-events-none" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-px bg-linear-to-r from-transparent via-green-600/20 to-transparent"
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
                            <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-950/90 p-4 sm:p-6 hover:border-green-600/50 transition-colors">
                                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                                    <div className="text-green-500">{stat.icon}</div>
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

            {/* ─── Follow CTA Banner ────────────────────────────────────────── */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 bg-gradient-to-r from-green-950/40 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-green-600 via-green-400 to-transparent" />

                <div className="mx-auto max-w-7xl relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Flag className="w-6 h-6 text-green-500" />
                                <span className="text-green-400 text-xs font-black uppercase tracking-[0.3em]">Keep up with the latest news in {area}</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-3">
                                Follow <span className="text-green-500">{area}</span>
                            </h2>
                            <p className="text-zinc-500 font-bold text-sm max-w-md">
                                Get the latest news, updates, and announcements in {area}.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 shrink-0">
                            <button
                                className={`group relative flex items-center gap-3 px-10 py-5 font-black uppercase italic tracking-wider text-base transition-all transform -skew-x-6 overflow-hidden bg-white text-black hover:bg-green-600 hover:text-white`}
                            >
                                <span className="transform skew-x-6 flex items-center gap-3">
                                    <Heart className={`w-5 h-5 group-hover:fill-white transition-all`} />
                                    Follow {area}
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </button>

                            <button className="flex items-center justify-center gap-3 px-10 py-3 font-black uppercase italic tracking-wider text-sm border border-zinc-700 text-zinc-400 hover:border-green-600 hover:text-green-400 transition-all transform -skew-x-6">
                                <span className="transform skew-x-6 flex items-center gap-3">
                                    <Bell className="w-4 h-4" />
                                    Enable area notifications
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
