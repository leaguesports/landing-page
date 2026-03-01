import { Bell, Flag, MapPin, Radio, TrendingUp, Trophy, Users, Zap } from "lucide-react";

const NAV_LINKS = [
    { label: "Venues", href: "#venues" },
    { label: "Sports", href: "#sports" },
    { label: "Players", href: "#players" },
];

const AREAS = [
    {
        name: "Midrand",
        description: "Midrand is a suburb of Johannesburg, South Africa.",
        href: "/play/midrand",
        span: 1,
        venues: 8,
        sports: 12,
    },
    {
        name: "Fourways",
        description: "Fourways is a suburb of Johannesburg, South Africa.",
        href: "/play/fourways",
        span: 1,
        venues: 5,
        sports: 9,
    },
    {
        name: "Sandton",
        description: "Sandton is a suburb of Johannesburg, South Africa.",
        href: "/play/sandton",
        span: 1,
        venues: 6,
        sports: 10,
    },
    {
        name: "Pretoria",
        description: "Pretoria is the capital of South Africa.",
        href: "/play/pretoria",
        span: 1,
        venues: 12,
        sports: 20,
    },
];

const VENUES = [
    {
        name: "Moreleta Park Sports Hub",
        location: "Moreleta Park, Pretoria",
        description: "Moreleta Park Sports Hub is a sports hub located in Moreleta Park, Pretoria.",
        image: "/images/venues/moreleta-park-sports-hub.jpg",
        href: "/venues/moreleta-park-sports-hub",
    },
    {
        name: "Moreleta Park Sports Hub",
        location: "Moreleta Park, Pretoria",
        description: "Moreleta Park Sports Hub is a sports hub located in Moreleta Park, Pretoria.",
        image: "/images/venues/moreleta-park-sports-hub.jpg",
        href: "/venues/moreleta-park-sports-hub",
    },
    {
        name: "Moreleta Park Sports Hub",
        location: "Moreleta Park, Pretoria",
        description: "Moreleta Park Sports Hub is a sports hub located in Moreleta Park, Pretoria.",
        image: "/images/venues/moreleta-park-sports-hub.jpg",
        href: "/venues/moreleta-park-sports-hub",
    },
    {
        name: "Moreleta Park Sports Hub",
        location: "Moreleta Park, Pretoria",
        description: "Moreleta Park Sports Hub is a sports hub located in Moreleta Park, Pretoria.",
        image: "/images/venues/moreleta-park-sports-hub.jpg",
        href: "/venues/moreleta-park-sports-hub",
    },
];

/* eslint-disable @next/next/no-img-element */
export default async function PlayPage() {

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
                                Play Now
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
                        Play
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
                        <span className="text-white">PLAY</span>
                        <br />
                        <span className="text-green-400">Now</span>
                        <span className="text-white">.</span>
                    </h1>

                    <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-sm mb-10 max-w-lg">
                        Discover venues to play your favorite sports.
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
                    {/* <div className="flex flex-wrap gap-4 items-center">
                        <button
                            className={`group relative flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm transition-all transform -skew-x-6 overflow-hidden bg-white text-black hover:bg-green-600 hover:text-white`}
                        >
                            <span className="transform skew-x-6 flex items-center gap-3">
                                <Heart className={`w-5 h-5 transition-all group-hover:fill-white`} />
                                Follow F1
                            </span>
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </button>

                        <button className="flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm border border-white/20 text-white hover:border-green-500 hover:text-green-400 transition-all transform -skew-x-6">
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
                    </div> */}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
            </section>

            {/* ─── Areas ────────────────────────────────────────────────────── */}
            <section id="areas" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Section heading */}
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <div className="bg-green-600 inline-block px-6 py-1.5 transform -skew-x-6 mb-3">
                                <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
                                    Areas
                                </h2>
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs ml-4">
                                Discover what areas are available to play your favorite sports.
                            </p>
                        </div>
                    </div>

                    {/* Areas cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                        {AREAS.map((area, index) => (
                            <a
                                key={index}
                                href={area.href}
                                className={`group relative cursor-pointer transition-all duration-300 block col-span-${area.span}`}
                            >
                                {/* Shadow offset */}
                                <div className="absolute inset-0 transform -skew-x-3 translate-x-2 translate-y-2 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3 bg-green-600/40" />

                                <div className="relative bg-zinc-950 transform -skew-x-3 overflow-hidden border border-zinc-800 group-hover:border-green-600/50 transition-colors duration-300">

                                    {/* Top accent */}
                                    <div className="h-1 w-full bg-green-600 group-hover:bg-green-400 transition-colors duration-300" />

                                    <div className="transform skew-x-3 p-5">

                                        {/* Name */}
                                        <h3 className="font-black italic uppercase leading-tight text-2xl text-white mb-2">
                                            {area.name}
                                        </h3>

                                        {/* Stats */}
                                        <div className="flex items-center gap-5 mb-5">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                                <span className="text-white font-black italic text-2xl leading-none">{area.venues}</span>
                                                <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.15em]">Venues</span>
                                            </div>
                                            <div className="w-px h-4 bg-zinc-700" />
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                                <span className="text-white font-black italic text-2xl leading-none">{area.sports}</span>
                                                <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.15em]">Sports</span>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-end pt-4 border-t border-zinc-800">
                                            {/* <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3 text-green-500 shrink-0" />
                                                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                                    {area.name}
                                                </span>
                                            </div> */}
                                            <span className="text-green-400 text-[10px] font-black uppercase tracking-widest group-hover:text-green-300 transition-colors">
                                                Explore →
                                            </span>
                                        </div>
                                    </div>

                                    {/* Green accent line — animates in on hover */}
                                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-green-500 group-hover:w-full transition-all duration-300" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Venues ────────────────────────────────────────────────────── */}
            <section id="next-races" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">

                    {/* Section heading */}
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <div className="bg-green-600 inline-block px-6 py-1.5 transform -skew-x-6 mb-3">
                                <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
                                    Venues
                                </h2>
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs ml-4">
                                Venues to play your favorite sports.
                            </p>
                        </div>
                    </div>

                    {/* Venue cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                        {VENUES.map((venue, index) => (
                            <div
                                key={index}
                                className={`group relative cursor-pointer transition-all duration-300`}
                            >
                                {/* Shadow offset */}
                                <div className={`absolute inset-0 transform -skew-x-3 translate-x-1.5 translate-y-1.5 transition-transform group-hover:translate-x-2.5 group-hover:translate-y-2.5 bg-zinc-700`} />

                                <div className={`relative bg-zinc-950 border transform -skew-x-3 overflow-hidden border-zinc-800`}>

                                    {/* Top accent */}
                                    <div className={`h-1 w-full bg-zinc-700`} />

                                    <div className="transform skew-x-3 p-6">

                                        {/* Round + flag */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500`}>
                                                {venue.name}
                                            </span>
                                        </div>

                                        {/* Race name */}
                                        <h3 className={`font-black italic uppercase leading-tight mb-1 text-xl text-white`}>
                                            {venue.name}
                                        </h3>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-5">
                                            {venue.description}
                                        </p>

                                        {/* Details */}
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                                                <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                <span>{venue.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ─── Speed Stats Banner ───────────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-green-600/5 pointer-events-none" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-px bg-gradient-to-r from-transparent via-green-600/20 to-transparent"
                            style={{ top: `${20 + i * 15}%`, left: "-10%", right: "-10%", transform: "skewY(-2deg)" }}
                        />
                    ))}
                </div>

                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { icon: <Zap className="w-6 h-6" />, value: "375 km/h", label: "Top Speed" },
                            { icon: <TrendingUp className="w-6 h-6" />, value: "1.6s", label: "0–100 km/h" },
                            { icon: <Trophy className="w-6 h-6" />, value: "5G", label: "Cornering Force" },
                            { icon: <Radio className="w-6 h-6" />, value: "1000+", label: "Sensors per Car" },
                        ].map((stat) => (
                            <div key={stat.label} className="group relative">
                                <div className="absolute inset-0 bg-green-600 transform -skew-x-6 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
                                <div className="relative bg-zinc-950 border border-zinc-800 p-6 transform -skew-x-6 hover:border-green-600/50 transition-all">
                                    <div className="transform skew-x-6 flex flex-col items-center text-center gap-3">
                                        <div className="text-green-500">{stat.icon}</div>
                                        <div>
                                            <p className="text-white text-2xl font-black italic leading-none">{stat.value}</p>
                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">{stat.label}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Follow CTA Banner ────────────────────────────────────────── */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 bg-gradient-to-r from-green-950/40 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-green-600 via-green-400 to-transparent" />

                <div className="mx-auto max-w-7xl relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Flag className="w-6 h-6 text-green-500" />
                                <span className="text-green-400 text-xs font-black uppercase tracking-[0.3em]">Never Miss a Venue</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-3">
                                Follow <span className="text-green-500">Venues</span>
                            </h2>
                            <p className="text-zinc-500 font-bold text-sm max-w-md">
                                Be notified when new venues are available.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 shrink-0">

                            <button className="flex items-center justify-center gap-3 px-10 py-3 font-black uppercase italic tracking-wider text-sm border border-zinc-700 text-zinc-400 hover:border-green-600 hover:text-green-400 transition-all transform -skew-x-6">
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
    );
}
