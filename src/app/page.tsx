"use client";

import {
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  Flag,
  Heart,
  Trophy,
  TrophyIcon,
  Tv,
  TvIcon,
  Users,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// ─── Upcoming events ───────────────────────────────────────────────────────
const UPCOMING_EVENTS = [
  {
    id: "evt-1",
    title: "Monaco Grand Prix",
    series: "Formula 1",
    sport: "Formula 1",
    date: "25 May 2025",
    time: "15:00",
    href: "/events",
    round: "R08",
    image: "https://images.sportschau.de/image/2d5995ba-55ad-4b31-8df7-b20be7fb5a17/AAABmIT5oOs/AAABmyZE3MM/1x1-1400/norris-piastri-108.jpg",
  },
  {
    id: "evt-2",
    title: "Lions vs Bulls",
    series: "Super Rugby",
    sport: "Rugby",
    date: "1 Jun 2025",
    time: "17:00",
    href: "/events",
    image: "https://images.unsplash.com/photo-1574602904329-56e2f95fb15e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "evt-3",
    title: "Manchester United vs Liverpool",
    series: "Premier League",
    sport: "Soccer",
    date: "8 Jun 2025",
    time: "19:30",
    href: "/events",
    image: "https://images.unsplash.com/flagged/photo-1550413231-202a9d53a331?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "evt-4",
    title: "Canadian Grand Prix",
    series: "MotoGP",
    sport: "Formula 1",
    date: "15 Jun 2025",
    time: "20:00",
    href: "/events",
    round: "R09",
    image: "https://img.redbull.com/images/c_crop,w_3840,h_1920,x_0,y_194/c_auto,w_1200,h_630/f_auto,q_auto/redbullcom/2025/6/1/ukxsn3eamlsz9ji2okdt/extreme-f1-tracks-zandvoort",
  },
];

// ─── Skewed section heading badge ─────────────────────────────────────────
function SectionBadge({
  label,
  color,
}: {
  label: string;
  color: "blue" | "green" | "red";
}) {
  const bg = { blue: "bg-blue-600", green: "bg-green-600", red: "bg-red-600" }[color];
  return (
    <div className={`${bg} inline-block px-6 py-1.5 transform -skew-x-6 mb-3`}>
      <h2 className="text-white font-black italic uppercase text-2xl transform skew-x-6">
        {label}
      </h2>
    </div>
  );
}

// ─── Sport DNA config ──────────────────────────────────────────────────────
const SPORT_DNA: Record<
  string,
  {
    cssVar: string;
    hex: string;
    shadowBg: string;
    borderHover: string;
    topBorder: string;
    tagColor: string;
    btnColor: string;
    btnHover: string;
    bottomLine: string;
    imgClass: string;
    watermark: React.ReactNode;
    dnaBadge: (event: (typeof UPCOMING_EVENTS)[number]) => React.ReactNode;
  }
> = {
  "Formula 1": {
    cssVar: "var(--color-f1)",
    hex: "#FF1801",
    shadowBg: "bg-[#FF1801]/30",
    borderHover: "group-hover:border-[#FF1801]/50",
    topBorder: "bg-[#FF1801]",
    tagColor: "text-[#FF1801]",
    btnColor: "text-[#FF1801]",
    btnHover: "group-hover:text-red-300",
    bottomLine: "bg-[#FF1801]",
    imgClass: "img-treatment-f1",
    watermark: (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="currentColor"
        aria-hidden="true"
      >
        {/* Steering wheel */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="7" />
        <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="6" />
        {/* Spokes */}
        <line x1="50" y1="40" x2="50" y2="18" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="60" x2="37" y2="79" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="60" x2="63" y2="79" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        {/* Flat bottom of wheel */}
        <path d="M 20 68 Q 50 80 80 68" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      </svg>
    ),
    dnaBadge: (event) =>
      event.round ? (
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FF1801]">
          {event.round}
        </span>
      ) : null,
  },

  Rugby: {
    cssVar: "var(--color-rugby)",
    hex: "#2d6a2d",
    shadowBg: "bg-[#2d6a2d]/30",
    borderHover: "group-hover:border-[#2d6a2d]/60",
    topBorder: "bg-[#2d6a2d]",
    tagColor: "text-[#4ade80]",
    btnColor: "text-[#4ade80]",
    btnHover: "group-hover:text-green-300",
    bottomLine: "bg-[#2d6a2d]",
    imgClass: "img-treatment-rugby",
    watermark: (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="currentColor"
        aria-hidden="true"
      >
        {/* Rugby ball */}
        <ellipse cx="50" cy="50" rx="36" ry="22" fill="none" stroke="currentColor" strokeWidth="5" />
        {/* Seam */}
        <path d="M 14 50 Q 50 30 86 50" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 3" />
        <path d="M 14 50 Q 50 70 86 50" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 3" />
        {/* Lace */}
        <line x1="50" y1="32" x2="50" y2="68" stroke="currentColor" strokeWidth="3" />
        <line x1="44" y1="40" x2="56" y2="40" stroke="currentColor" strokeWidth="2.5" />
        <line x1="44" y1="50" x2="56" y2="50" stroke="currentColor" strokeWidth="2.5" />
        <line x1="44" y1="60" x2="56" y2="60" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    ),
    dnaBadge: (event) => (
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#4ade80]">
        KO {event.time}
      </span>
    ),
  },

  Soccer: {
    cssVar: "var(--color-soccer)",
    hex: "#1a6fb5",
    shadowBg: "bg-[#1a6fb5]/30",
    borderHover: "group-hover:border-[#1a6fb5]/50",
    topBorder: "bg-[#1a6fb5]",
    tagColor: "text-[#60a5fa]",
    btnColor: "text-[#60a5fa]",
    btnHover: "group-hover:text-blue-300",
    bottomLine: "bg-[#1a6fb5]",
    imgClass: "",
    watermark: (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="currentColor"
        aria-hidden="true"
      >
        {/* Soccer ball */}
        <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="5" />
        {/* Pentagon patches */}
        <polygon points="50,20 58,30 55,42 45,42 42,30" fill="none" stroke="currentColor" strokeWidth="3" />
        <polygon points="50,80 58,70 55,58 45,58 42,70" fill="none" stroke="currentColor" strokeWidth="3" />
        <polygon points="22,38 32,32 42,40 38,52 26,52" fill="none" stroke="currentColor" strokeWidth="3" />
        <polygon points="78,38 68,32 58,40 62,52 74,52" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
    dnaBadge: (event) => (
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#60a5fa]">
        KO {event.time}
      </span>
    ),
  },
};

const DEFAULT_DNA = {
  cssVar: "var(--color-default)",
  hex: "#6b7280",
  shadowBg: "bg-zinc-600/30",
  borderHover: "group-hover:border-zinc-600/50",
  topBorder: "bg-zinc-600",
  tagColor: "text-zinc-400",
  btnColor: "text-zinc-400",
  btnHover: "group-hover:text-zinc-300",
  bottomLine: "bg-zinc-600",
  imgClass: "",
  watermark: null,
  dnaBadge: () => null,
};

// ─── Event card ────────────────────────────────────────────────────────────
function EventCard({ event }: { event: (typeof UPCOMING_EVENTS)[number] }) {
  const dna = SPORT_DNA[event.sport] ?? DEFAULT_DNA;

  return (
    <Link
      href={event.href}
      className="group block bg-zinc-900 overflow-hidden hover:bg-zinc-800/80 transition-colors duration-200 rounded-sm border-b"
      style={{ borderColor: dna.hex }}
    >
      {/* Image with title overlay */}
      <div className="relative aspect-video overflow-hidden bg-zinc-800">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `${dna.hex}18` }}
          >
            <div style={{ opacity: 0.15, color: dna.hex, width: "5rem", height: "5rem" }}>
              {dna.watermark}
            </div>
          </div>
        )}

        {/* Scrim */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Meta panel */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2">
        <div>
          <p className="text-xs tracking-wide uppercase" style={{ color: dna.hex }}>
            {event.series}
          </p>
          <h3 className="text-sm sm:text-base min-h-[2.5rem] sm:min-h-[3.5rem] leading-snug text-white drop-shadow-lg font-black uppercase">
            {event.title}
          </h3>
        </div>
        <div className=" text-zinc-500 text-xs ">
          <span className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3 h-3 shrink-0" />
            {event.date} @ {event.time}
          </span>
          <span className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3 h-3 shrink-0" />
            {event.time}
          </span>
          {/* {dna.dnaBadge(event)} */}
        </div>
      </div>
    </Link>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[70vh] sm:min-h-[80vh] lg:min-h-[88vh] flex items-end">

        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-green-950/60 via-[#0f0f0f] to-[#0f0f0f]" />

        {/* Speed lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-linear-to-r from-transparent via-green-600/30 to-transparent"
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

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
          }}
        />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span
            className="text-[20vw] font-black italic uppercase text-white/2 leading-none tracking-tighter"
            style={{ fontStretch: "condensed" }}
          >
            League
          </span>
        </div>

        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-green-700 via-green-500 to-green-700" />

        {/* Glow orb */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20 pt-10 sm:pt-16 w-full">

          {/* Platform headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[10rem] font-black italic uppercase leading-none tracking-tighter mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-3xl md:text-4xl lg:text-[6rem] tracking-tight">The Home of</span>
            <br />
            <span className="text-green-400">Sports</span>
          </h1>

          <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm mb-8 sm:mb-10 max-w-2xl">
            The all in one sports platform. <br className="hidden sm:block" /> Follow the season, find local sports venues, and book your next game all in one place.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 items-center">
            <Link href="/watch"
              className={`group relative flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm transition-all transform -skew-x-6 overflow-hidden bg-blue-500 text-white hover:bg-white hover:text-black cursor-pointer`}
            >
              <span className="transform skew-x-6 flex items-center gap-3">
                <TvIcon className={`w-5 h-5 transition-all group-hover:text-black`} />
                Watch Sports
              </span>
            </Link>

            <Link href="/play"
              className={`group relative flex items-center gap-3 px-8 py-4 font-black uppercase italic tracking-wider text-sm transition-all transform -skew-x-6 overflow-hidden bg-green-500 text-white hover:bg-white hover:text-black cursor-pointer`}
            >
              <span className="transform skew-x-6 flex items-center gap-3">
                <TrophyIcon className={`w-5 h-5 transition-all group-hover:text-black`} />
                Play Sports
              </span>
            </Link>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
      </section>

      {/* ─── Stats banner ─────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-linear-to-r from-transparent via-white/5 to-transparent"
              style={{ top: `${20 + i * 15}%`, left: "-10%", right: "-10%", transform: "skewY(-2deg)" }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: <Tv className="w-5 h-5 sm:w-6 sm:h-6" />, value: "500+", label: "Watch Venues", color: "text-blue-500", borderColor: "border-blue-600/30" },
              { icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />, value: "200+", label: "Play Venues", color: "text-green-500", borderColor: "border-green-600/30" },
              { icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />, value: "1,200+", label: "Events / Year", color: "text-red-500", borderColor: "border-red-600/30" },
              { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, value: "10K+", label: "Active Players", color: "text-zinc-400", borderColor: "border-zinc-600/30" },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-lg border ${stat.borderColor} bg-zinc-950 p-4 sm:p-6 transition-colors hover:border-zinc-700`}>
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                  <div className={stat.color}>{stat.icon}</div>
                  <div>
                    <p className="text-white text-xl sm:text-2xl font-black italic leading-none">{stat.value}</p>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What's Happening Feed ────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* ── Upcoming Sports ── */}
          <div className="mb-12 sm:mb-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
              <div>
                <SectionBadge label="Upcoming Sports" color="red" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1 sm:mt-0 sm:ml-4">
                  Top sports happening around the world
                </p>
              </div>
              <Link
                href="/events"
                className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-300 transition-colors flex items-center gap-1 shrink-0"
              >
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-8">
              {UPCOMING_EVENTS.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ─── CTA banner ───────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-linear-to-r from-green-950/30 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-green-600 via-green-400 to-transparent" />

        <div className="mx-auto max-w-7xl relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <Flag className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-green-500" />
                <span className="text-green-400 text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                  LeagueSports
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase leading-none tracking-tighter text-white mb-2 sm:mb-3">
                Find Your <span className="text-green-400">Game</span>
              </h2>
              <p className="text-zinc-500 font-bold text-xs sm:text-sm max-w-md">
                Discover venues, join events, and connect with players in your area.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full sm:w-auto sm:shrink-0">
              <Link
                href="/venues"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 font-black uppercase italic tracking-wider text-xs sm:text-sm bg-green-600 text-white hover:bg-green-500 transition-colors rounded-lg"
              >
                <Zap className="w-4 h-4 shrink-0" />
                Explore Venues
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 font-black uppercase italic tracking-wider text-xs sm:text-sm border border-zinc-700 text-zinc-400 hover:border-green-600 hover:text-green-400 transition-colors rounded-lg"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
