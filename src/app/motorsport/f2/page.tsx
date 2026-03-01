"use client";

import { useState } from "react";
import { Flag, Heart, Bell, MapPin, Clock, Calendar, ChevronRight, Zap, Trophy, TrendingUp, Radio, Star } from "lucide-react";

const NAV_LINKS = [
    { label: "Next Races", href: "#next-races" },
    { label: "Standings", href: "#standings" },
    { label: "Teams", href: "#teams" },
    { label: "Latest News", href: "#news" },
];

const NEXT_RACES = [
    {
        round: "R08",
        name: "Monaco Grand Prix",
        circuit: "Circuit de Monaco",
        location: "Monte Carlo, Monaco",
        date: "25 May 2025",
        time: "15:00 CEST",
        laps: 78,
        distance: "260.286 km",
        flag: "🇲🇨",
        highlight: true,
    },
    {
        round: "R09",
        name: "Canadian Grand Prix",
        circuit: "Circuit Gilles Villeneuve",
        location: "Montréal, Canada",
        date: "15 Jun 2025",
        time: "14:00 EDT",
        laps: 70,
        distance: "305.270 km",
        flag: "🇨🇦",
        highlight: false,
    },
    {
        round: "R10",
        name: "Spanish Grand Prix",
        circuit: "Circuit de Barcelona-Catalunya",
        location: "Barcelona, Spain",
        date: "29 Jun 2025",
        time: "15:00 CEST",
        laps: 66,
        distance: "307.236 km",
        flag: "🇪🇸",
        highlight: false,
    },
    {
        round: "R11",
        name: "Austrian Grand Prix",
        circuit: "Red Bull Ring",
        location: "Spielberg, Austria",
        date: "6 Jul 2025",
        time: "15:00 CEST",
        laps: 71,
        distance: "306.452 km",
        flag: "🇦🇹",
        highlight: false,
    },
];

const STANDINGS = [
    { pos: 1, driver: "M. Verstappen", team: "Red Bull Racing", pts: 161, gap: "—", flag: "🇳🇱" },
    { pos: 2, driver: "L. Hamilton", team: "Ferrari", pts: 139, gap: "+22", flag: "🇬🇧" },
    { pos: 3, driver: "C. Leclerc", team: "Ferrari", pts: 128, gap: "+33", flag: "🇲🇨" },
    { pos: 4, driver: "L. Norris", team: "McLaren", pts: 113, gap: "+48", flag: "🇬🇧" },
    { pos: 5, driver: "C. Sainz", team: "Williams", pts: 97, gap: "+64", flag: "🇪🇸" },
];

const TEAMS = [
    { name: "Red Bull Racing", color: "#3671C6", wins: 4, pts: 212 },
    { name: "Ferrari", color: "#E8002D", wins: 3, pts: 267 },
    { name: "McLaren", color: "#FF8000", wins: 1, pts: 176 },
    { name: "Mercedes", color: "#27F4D2", wins: 0, pts: 134 },
    { name: "Aston Martin", color: "#229971", wins: 0, pts: 56 },
];

const NEWS = [
    {
        tag: "Race Report",
        title: "Verstappen Dominates in Bahrain Opener",
        excerpt: "Max Verstappen led from pole to flag in a commanding display at the season opener.",
        time: "2h ago",
        hot: true,
    },
    {
        tag: "Technical",
        title: "McLaren Unveil Radical Upgrade Package",
        excerpt: "The Woking outfit brings a sweeping aero overhaul targeting Monaco and beyond.",
        time: "5h ago",
        hot: false,
    },
    {
        tag: "Driver News",
        title: "Hamilton Settles Into New Life at Ferrari",
        excerpt: "Seven-time champion speaks on adapting to the Prancing Horse ahead of Monaco.",
        time: "1d ago",
        hot: false,
    },
];

export default function F2Page() {
    const [following, setFollowing] = useState(false);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">

            {/* ─── In-page nav ─────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
                        {/* Sport badge */}
                        <div className="flex items-center gap-2 mr-6 shrink-0">
                            <div className="bg-blue-500 px-3 py-1 transform -skew-x-6">
                                <span className="transform skew-x-6 block text-xs font-black uppercase tracking-widest text-white">
                                    F2
                                </span>
                            </div>
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest hidden sm:block">
                                Formula 2
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
                            onClick={() => setFollowing((f) => !f)}
                            className={`ml-auto shrink-0 flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all transform -skew-x-6 ${following
                                ? "bg-blue-500 text-white"
                                : "bg-white/10 text-white hover:bg-blue-500"
                                }`}
                        >
                            <span className="transform skew-x-6 flex items-center gap-2">
                                <Heart className={`w-3.5 h-3.5 ${following ? "fill-white" : ""}`} />
                                {following ? "Following" : "Follow"}
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden min-h-[85vh] flex items-end">

                {/* Background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-[#0f0f0f] to-[#0f0f0f]" />

                {/* Speed lines */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
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

                {/* Large F2 background text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                    <span
                        className="text-[28vw] font-black italic uppercase text-white/[0.02] leading-none tracking-tighter"
                        style={{ fontStretch: "condensed" }}
                    >
                        F2
                    </span>
                </div>

                {/* Red accent bar — top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700" />

                {/* Glowing orb */}
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

                {/* Content */}
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-32 w-full">

                    {/* Season badge */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-500 px-4 py-1.5 transform -skew-x-6">
                            <span className="transform skew-x-6 block text-xs font-black uppercase tracking-[0.2em] text-white">
                                2025 Season
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Live Season</span>
                        </div>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-black italic uppercase leading-none tracking-tighter mb-4">
                        <span className="text-white">FORMULA</span>
                        <br />
                        <span className="text-blue-500">TWO</span>
                        <span className="text-white">.</span>
                    </h1>

                    <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-sm mb-10 max-w-lg">
                        The next generation of motorsport. 12 races. 22 drivers. One world champion.
                    </p>

                    {/* Stats strip */}
                    <div className="flex flex-wrap gap-6 mb-12">
                        {[
                            { label: "Races", value: "12" },
                            { label: "Teams", value: "12" },
                            { label: "Drivers", value: "22" },
                            { label: "Continents", value: "4" },
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
                            onClick={() => setFollowing((f) => !f)}
                            className={`group relative flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm transition-all transform -skew-x-6 overflow-hidden ${following
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black hover:bg-blue-500 hover:text-white"
                                }`}
                        >
                            <span className="transform skew-x-6 flex items-center gap-3">
                                <Heart className={`w-5 h-5 transition-all ${following ? "fill-white scale-110" : "group-hover:fill-white"}`} />
                                {following ? "Following F2" : "Follow F2"}
                            </span>
                            {/* Shimmer */}
                            {!following && (
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            )}
                        </button>

                        <button className="flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm border border-white/20 text-white hover:border-blue-500 hover:text-blue-400 transition-all transform -skew-x-6">
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
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
            </section>

            {/* ─── Next 4 Races ─────────────────────────────────────────────── */}
            <section id="next-races" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">

                    {/* Section heading */}
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <div className="bg-blue-500 inline-block px-6 py-1.5 transform -skew-x-6 mb-3">
                                <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
                                    Next Races
                                </h2>
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs ml-4">
                                2025 FIA Formula 2 World Championship
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                            <Calendar className="w-4 h-4" />
                            <span>Season Calendar</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Race cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {NEXT_RACES.map((race) => (
                            <div
                                key={race.round}
                                className={`group relative cursor-pointer transition-all duration-300 ${race.highlight ? "sm:col-span-2 xl:col-span-2" : ""}`}
                            >
                                {/* Shadow offset */}
                                <div className={`absolute inset-0 transform -skew-x-3 translate-x-1.5 translate-y-1.5 transition-transform group-hover:translate-x-2.5 group-hover:translate-y-2.5 ${race.highlight ? "bg-blue-600" : "bg-zinc-700"}`} />

                                <div className={`relative bg-zinc-950 border transform -skew-x-3 overflow-hidden ${race.highlight ? "border-blue-600/50" : "border-zinc-800"}`}>

                                    {/* Top accent */}
                                    <div className={`h-1 w-full ${race.highlight ? "bg-blue-600" : "bg-zinc-700"}`} />

                                    <div className="transform skew-x-3 p-6">

                                        {/* Round + flag */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${race.highlight ? "text-blue-400" : "text-zinc-500"}`}>
                                                {race.round}
                                            </span>
                                            <span className="text-2xl">{race.flag}</span>
                                        </div>

                                        {/* Race name */}
                                        <h3 className={`font-black italic uppercase leading-tight mb-1 ${race.highlight ? "text-3xl text-white" : "text-xl text-white"}`}>
                                            {race.name}
                                        </h3>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-5">
                                            {race.circuit}
                                        </p>

                                        {/* Details */}
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                                                <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                <span>{race.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                                                <Calendar className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                <span>{race.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                                                <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                <span>{race.time}</span>
                                            </div>
                                        </div>

                                        {/* Laps / Distance */}
                                        <div className="flex gap-4 pt-4 border-t border-zinc-800">
                                            <div>
                                                <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Laps</p>
                                                <p className="text-white font-black italic text-lg leading-none">{race.laps}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Distance</p>
                                                <p className="text-white font-black italic text-lg leading-none">{race.distance}</p>
                                            </div>
                                            <div className="ml-auto self-end">
                                                <button className={`px-4 py-2 text-xs font-black uppercase italic transition-all transform -skew-x-6 ${race.highlight
                                                    ? "bg-blue-600 text-white hover:bg-white hover:text-black"
                                                    : "bg-zinc-800 text-white hover:bg-blue-600"
                                                    }`}>
                                                    <span className="transform skew-x-6 block">Details</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Standings ────────────────────────────────────────────────── */}
            <section id="standings" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950/50">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Driver Standings */}
                        <div>
                            <div className="bg-blue-600 inline-block px-6 py-1.5 transform -skew-x-6 mb-3">
                                <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
                                    Drivers
                                </h2>
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs ml-4 mb-8">
                                Championship Standings
                            </p>

                            <div className="space-y-2">
                                {STANDINGS.map((driver) => (
                                    <div
                                        key={driver.pos}
                                        className="group relative flex items-center bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 transition-all overflow-hidden cursor-pointer"
                                    >
                                        {/* Position accent */}
                                        <div className={`w-1 self-stretch ${driver.pos === 1 ? "bg-blue-600" : driver.pos === 2 ? "bg-zinc-400" : driver.pos === 3 ? "bg-amber-600" : "bg-zinc-700"}`} />

                                        <div className="flex items-center gap-4 px-5 py-4 flex-1">
                                            <span className="text-zinc-600 font-black italic text-sm w-6 shrink-0">
                                                {String(driver.pos).padStart(2, "0")}
                                            </span>
                                            <span className="text-lg">{driver.flag}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-black italic uppercase text-sm leading-none group-hover:text-blue-400 transition-colors truncate">
                                                    {driver.driver}
                                                </p>
                                                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider mt-0.5 truncate">
                                                    {driver.team}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="px-5 text-right shrink-0">
                                            <p className="text-white font-black italic text-xl leading-none">{driver.pts}</p>
                                            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">PTS</p>
                                        </div>

                                        <div className="px-4 w-16 text-right shrink-0">
                                            <p className={`font-black italic text-sm ${driver.gap === "—" ? "text-blue-500" : "text-zinc-500"}`}>
                                                {driver.gap}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Constructor Standings */}
                        <div>
                            <div className="bg-blue-600 inline-block px-6 py-1.5 transform -skew-x-6 mb-3">
                                <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
                                    Constructors
                                </h2>
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs ml-4 mb-8">
                                Championship Standings
                            </p>

                            <div className="space-y-3" id="teams">
                                {TEAMS.map((team, teamIndex) => (
                                    <div key={team.name} className="group relative bg-zinc-900 border border-zinc-800 hover:border-white/20 transition-all p-5 cursor-pointer overflow-hidden">
                                        {/* Color bar */}
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1"
                                            style={{ backgroundColor: team.color }}
                                        />

                                        <div className="flex items-center gap-4 pl-3">
                                            <span className="text-zinc-600 font-black italic text-sm w-4 shrink-0">
                                                {teamIndex + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-black italic uppercase text-sm leading-none group-hover:text-white transition-colors truncate">
                                                    {team.name}
                                                </p>
                                                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                                                    {team.wins} {team.wins === 1 ? "Win" : "Wins"} this season
                                                </p>
                                            </div>

                                            {/* Points bar */}
                                            <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                                                <div className="w-32 bg-zinc-800 h-1.5 overflow-hidden">
                                                    <div
                                                        className="h-full transition-all duration-1000"
                                                        style={{
                                                            width: `${(team.pts / 300) * 100}%`,
                                                            backgroundColor: team.color,
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-white font-black italic text-sm leading-none">{team.pts} <span className="text-zinc-600 text-[9px] font-black uppercase">PTS</span></p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Speed Stats Banner ───────────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-px bg-gradient-to-r from-transparent via-blue-600/20 to-transparent"
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
                                <div className="absolute inset-0 bg-blue-400 transform -skew-x-6 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
                                <div className="relative bg-zinc-950 border border-zinc-800 p-6 transform -skew-x-6 hover:border-blue-400/50 transition-all">
                                    <div className="transform skew-x-6 flex flex-col items-center text-center gap-3">
                                        <div className="text-blue-400">{stat.icon}</div>
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

            {/* ─── Latest News ──────────────────────────────────────────────── */}
            <section id="news" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">

                    <div className="bg-blue-600 inline-block px-6 py-1.5 transform -skew-x-6 mb-3">
                        <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
                            Latest News
                        </h2>
                    </div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-10">
                        Straight from the paddock
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {NEWS.map((item) => (
                            <div key={item.title} className="group relative cursor-pointer">
                                <div className="absolute inset-0 bg-blue-600 transform -skew-x-3 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
                                <div className="relative bg-zinc-950 border border-zinc-800 p-6 transform -skew-x-3 hover:border-blue-600/40 transition-all">
                                    <div className="transform skew-x-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                                                {item.tag}
                                            </span>
                                            {item.hot && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-blue-500 fill-blue-500" />
                                                    <span className="text-blue-500 text-[10px] font-black uppercase">Hot</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-white font-black italic uppercase text-lg leading-tight mb-2 group-hover:text-blue-400 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-zinc-500 text-sm font-bold mb-4 leading-relaxed">
                                            {item.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                                            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{item.time}</span>
                                            <span className="text-blue-500 text-xs font-black uppercase italic flex items-center gap-1 group-hover:gap-2 transition-all">
                                                Read <ChevronRight className="w-3.5 h-3.5" />
                                            </span>
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-600 via-blue-400 to-transparent" />

                <div className="mx-auto max-w-7xl relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Flag className="w-6 h-6 text-blue-500" />
                                <span className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">Never Miss a Race</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-3">
                                Follow <span className="text-blue-500">F2</span>
                            </h2>
                            <p className="text-zinc-500 font-bold text-sm max-w-md">
                                Get race alerts, live standings updates, and breaking paddock news delivered straight to you.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 shrink-0">
                            <button
                                onClick={() => setFollowing((f) => !f)}
                                className={`group relative flex items-center gap-3 px-10 py-5 font-black uppercase italic tracking-wider text-base transition-all transform -skew-x-6 overflow-hidden ${following
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-black hover:bg-blue-600 hover:text-white"
                                    }`}
                            >
                                <span className="transform skew-x-6 flex items-center gap-3">
                                    <Heart className={`w-5 h-5 ${following ? "fill-white" : "group-hover:fill-white"} transition-all`} />
                                    {following ? "Following F2" : "Follow F2"}
                                </span>
                                {!following && (
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                )}
                            </button>

                            <button className="flex items-center justify-center gap-3 px-10 py-3 font-black uppercase italic tracking-wider text-sm border border-zinc-700 text-zinc-400 hover:border-blue-600 hover:text-blue-400 transition-all transform -skew-x-6">
                                <span className="transform skew-x-6 flex items-center gap-3">
                                    <Bell className="w-4 h-4" />
                                    Enable Race Alerts
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
