"use client";

import Link from "next/link";
import { useState } from "react";
import { sportsList } from "@/config/sports";

export default function LandingPage() {
  const [activeDashboard, setActiveDashboard] = useState<"darts" | "racing">(
    "darts"
  );
  return (
    <div className="relative min-h-screen noise overflow-x-hidden">
      {/* Background effects */}
      <div className="mesh-gradient" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-slate-950 font-bold text-sm sm:text-lg">
                  L
                </span>
              </div>
              <span className="text-base sm:text-xl font-bold font-heading">
                League<span className="gradient-text">Sports</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#sports"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Sports
              </Link>
              <Link
                href="#how-it-works"
                className="text-slate-300 hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#features"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Features
              </Link>
            </div>
            <Link
              href="/waitlist"
              className="btn-primary px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm whitespace-nowrap shrink-0"
            >
              Waitlist
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 sm:pt-32 sm:pb-20 md:pt-44 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-6 sm:mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs sm:text-sm text-slate-300">
                Track, Practice, Compete — All in One Place
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-heading leading-tight mb-4 sm:mb-6 animate-fade-in-up animation-delay-100">
              Your Personal
              <br />
              <span className="gradient-text">Sports Hub.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 animate-fade-in-up animation-delay-200">
              One app for all your favorite sports. Get dedicated tools for
              practice drills, friendly matches, competitive play, detailed
              stats, and vibrant communities — everything you need to improve
              and have fun.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0 animate-fade-in-up animation-delay-300">
              <Link
                href="/waitlist"
                className="btn-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span>Join the Waitlist</span>
              </Link>
              <a
                href="#sports"
                className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Explore Sports
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Library Preview */}
      <section
        id="sports"
        className="py-12 sm:py-20 md:py-32 relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
        <div className="absolute top-1/4 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-secondary/5 rounded-full blur-3xl translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="flex gap-1">
                {["🎯", "🏎️", "🎾", "⛳"].map((emoji, i) => (
                  <span
                    key={i}
                    className="text-sm"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {emoji}
                  </span>
                ))}
              </span>
              <span className="text-sm text-slate-300">
                Multi-Sport Platform
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-4">
              One App, <span className="gradient-text">Every Sport</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto">
              Each sport gets its own custom dashboard, scoring system, and
              analytics. No generic interfaces — just tools built for your game.
            </p>
          </div>

          {/* Sports Grid - Desktop */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {sportsList.map((sport) => (
              <div
                key={sport.id}
                className="group glass-card rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300 relative"
                style={{ background: sport.bgPattern }}
              >
                {/* Hover glow effect */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${sport.gradient} blur-xl`}
                  style={{ opacity: 0.05 }}
                />

                <div className="p-5 lg:p-6 relative">
                  {/* Header Row */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <svg
                        className="w-7 h-7 lg:w-8 lg:h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={sport.icon}
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                        {sport.name}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {sport.description}
                      </p>
                    </div>
                  </div>

                  {/* Features Row */}
                  <div className="flex items-center gap-2 mb-4">
                    {[
                      { label: "Live Scoring", icon: "⚡" },
                      { label: "Analytics", icon: "📊" },
                      { label: "Leaderboards", icon: "🏆" },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/50 text-[10px] text-slate-400"
                      >
                        <span>{feature.icon}</span>
                        <span className="hidden lg:inline">
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Mode Pills */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                      Practice
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-[10px] font-medium border border-sky-500/20">
                      Casual
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium border border-amber-500/20">
                      Compete
                    </span>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}

            {/* Coming Soon Card - Desktop */}
            <div className="glass-card rounded-2xl border-2 border-dashed border-slate-700 hover:border-slate-600 transition-all group">
              <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="font-bold text-slate-300 text-lg mb-1">
                  More Sports Coming
                </span>
                <span className="text-sm text-slate-500 mb-3">
                  Snooker, Badminton, Bowling...
                </span>
                <span className="text-xs text-primary">Request a sport →</span>
              </div>
            </div>
          </div>

          {/* Sports Grid - Mobile */}
          <div className="sm:hidden">
            {/* Featured Sports (larger) */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {sportsList.slice(0, 2).map((sport) => (
                <div
                  key={sport.id}
                  className="glass-card rounded-xl overflow-hidden"
                  style={{ background: sport.bgPattern }}
                >
                  <div className="p-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center shadow-lg mb-3`}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={sport.icon}
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">
                      {sport.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2">
                      {sport.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Remaining Sports (compact) */}
            <div className="grid grid-cols-3 gap-2">
              {sportsList.slice(2).map((sport) => (
                <div
                  key={sport.id}
                  className="glass-card rounded-lg p-3"
                  style={{ background: sport.bgPattern }}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sport.gradient} flex items-center justify-center shadow-md`}
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={sport.icon}
                        />
                      </svg>
                    </div>
                    <span className="text-[11px] font-semibold text-white leading-tight">
                      {sport.name}
                    </span>
                  </div>
                </div>
              ))}

              {/* Coming Soon - Mobile */}
              <div className="glass-card rounded-lg p-3 border border-dashed border-slate-700">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 leading-tight">
                    More
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8">
            {[
              { value: "6+", label: "Sports Available" },
              { value: "Custom", label: "Dashboards" },
              { value: "∞", label: "Possibilities" },
            ].map((stat, i) => (
              <div key={i} className="text-center px-4 sm:px-6">
                <p className="text-2xl sm:text-3xl font-bold text-primary font-heading">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Integrations Section */}
      <section className="py-12 sm:py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs sm:text-sm text-slate-300">
                Zero Manual Entry
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Smart <span className="gradient-text-alt">Integrations</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto px-2">
              Connect your hardware and platforms. Data flows in automatically.
            </p>
          </div>

          <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent/10 to-transparent blur-3xl" />
            <div className="relative">
              {/* Integration grid */}
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  {
                    name: "Sim Racing UDP",
                    desc: "ACC, iRacing, GT7, F1 — auto lap times & telemetry",
                    icon: "🏎️",
                    highlight: true,
                  },
                  {
                    name: "Launch Monitors",
                    desc: "TrackMan, GCQuad, Mevo+ shot data",
                    icon: "⛳",
                  },
                  {
                    name: "Fitness APIs",
                    desc: "Apple Health, Garmin, WHOOP",
                    icon: "💪",
                  },
                  {
                    name: "Booking Systems",
                    desc: "Playtomic, ClubSpark court reservations",
                    icon: "📅",
                  },
                  {
                    name: "Weather Data",
                    desc: "Real-time course & track conditions",
                    icon: "🌤️",
                  },
                  {
                    name: "Smart Dartboards",
                    desc: "Auto-scoring from connected boards",
                    icon: "🎯",
                  },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-colors ${
                      integration.highlight
                        ? "bg-red-500/10 border-red-500/30 hover:border-red-500/50"
                        : "bg-slate-800/50 border-slate-700/50 hover:border-accent/30"
                    }`}
                  >
                    <span className="text-xl sm:text-2xl shrink-0">
                      {integration.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm sm:text-base">
                        {integration.name}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                        {integration.desc}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 shrink-0 ${
                        integration.highlight ? "text-red-400" : "text-accent"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ))}
              </div>

              {/* Bottom note */}
              <p className="text-center text-xs sm:text-sm text-slate-500 mt-4 sm:mt-6">
                More integrations coming soon. Have a request?{" "}
                <a href="#" className="text-accent hover:underline">
                  Let us know
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Modes Section */}
      <section className="py-16 sm:py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Play Your Way
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
              Whether you want to train, have fun with friends, or compete
              seriously — there&apos;s a mode for every moment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Practice Mode */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">
                  Practice
                </h3>
                <p className="text-slate-400 mb-6">
                  Structured drills designed to improve specific skills. Track
                  your consistency, set goals, and watch yourself get better.
                </p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Sport-specific drills
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Skill improvement metrics
                  </li>
                </ul>
              </div>
            </div>

            {/* Casual Mode */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">Casual</h3>
                <p className="text-slate-400 mb-6">
                  Play for fun with no pressure. Perfect for friendly matches
                  that don&apos;t affect your ranking or competitive stats.
                </p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    No ranking impact
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Solo or with friends
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Quick session logging
                  </li>
                </ul>
              </div>
            </div>

            {/* Competitive Mode */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-red-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-red-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">
                  Compete
                </h3>
                <p className="text-slate-400 mb-6">
                  Ranked matches that count. Climb leaderboards, earn your rank,
                  and prove you&apos;re the best among your peers.
                </p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Affects your ranking
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Global leaderboards
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Match format options
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Use Cases Section */}
      <section className="py-12 sm:py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs sm:text-sm text-slate-300">
                Built for Everyone
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              One App, <span className="gradient-text">Every Role</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto px-2">
              Whether you&apos;re playing, coaching, or officiating —
              LeagueSports adapts to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {/* The Player */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl" />
              <div className="relative">
                {/* Header */}
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold font-heading text-white">
                      The Player
                    </h3>
                    <p className="text-xs sm:text-sm text-primary font-medium">
                      The Performance Hub
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border-l-2 border-primary">
                  <p className="text-slate-300 text-xs sm:text-sm italic">
                    &quot;I want to focus on the game, not the phone.&quot;
                  </p>
                </div>

                {/* Key Tool */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Key Tool
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    🎮 Controller View
                  </p>
                </div>

                {/* Use cases */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-amber-500/20 text-amber-400 shrink-0">
                      PRACTICE
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Ghost Modes & Drill Timers to beat personal bests
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-400 shrink-0">
                      CASUAL
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Quick-entry scores to get back to the match
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-red-500/20 text-red-400 shrink-0">
                      COMPETE
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Real-time ELO/Rating changes after the final point
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* The Coach */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden group hover:border-accent/30 transition-colors">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-accent/10 to-transparent blur-3xl" />
              <div className="relative">
                {/* Header */}
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-lg shadow-accent/30 shrink-0">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold font-heading text-white">
                      The Coach
                    </h3>
                    <p className="text-xs sm:text-sm text-accent font-medium">
                      The Strategy Command
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border-l-2 border-accent">
                  <p className="text-slate-300 text-xs sm:text-sm italic">
                    &quot;I need data to back up my instincts.&quot;
                  </p>
                </div>

                {/* Key Tool */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Key Tool
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    📊 Telemetry & Analytics View
                  </p>
                </div>

                {/* Use cases */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-sky-500/20 text-sky-400 shrink-0">
                      LIVE
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Watch 3-dart avg or tire temps, offer tactical adjustments
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-violet-500/20 text-violet-400 shrink-0">
                      DEVELOP
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Assign &quot;Homework Drills&quot; and track completion
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-pink-500/20 text-pink-400 shrink-0">
                      ANALYZE
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Heatmaps for shot placement or track positioning
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* The Referee */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden group hover:border-secondary/30 transition-colors">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-secondary/10 to-transparent blur-3xl" />
              <div className="relative">
                {/* Header */}
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-secondary to-rose-600 flex items-center justify-center shadow-lg shadow-secondary/30 shrink-0">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold font-heading text-white">
                      The Referee
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary font-medium">
                      The Rule Enforcer
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border-l-2 border-secondary">
                  <p className="text-slate-300 text-xs sm:text-sm italic">
                    &quot;I need a clean, authoritative record of the
                    match.&quot;
                  </p>
                </div>

                {/* Key Tool */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Key Tool
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    📋 Scoreboard & Admin View
                  </p>
                </div>

                {/* Use cases */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-orange-500/20 text-orange-400 shrink-0">
                      TIME
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Track injury time & penalty counts with automated alerts
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-cyan-500/20 text-cyan-400 shrink-0">
                      TRUTH
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Official source — scores push to all spectator devices
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-lime-500/20 text-lime-400 shrink-0">
                      SIGN
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Digital gamesheet sign-off, synced to league leaderboard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leagues & Tournaments Section */}
      <section className="py-12 sm:py-20 md:py-32 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-emerald-950/10" />
        <div className="absolute top-1/4 left-0 sm:left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-0 sm:right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-sky-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {/* Header with Trophy Icon */}
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 mb-6 shadow-2xl shadow-emerald-500/30 relative">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7l-3-7z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">!</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Run <span className="text-emerald-400">Professional</span> Events
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto px-2">
              From pub leagues to esports championships. One platform to rule
              them all.
            </p>
          </div>

          {/* Main Content: Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* Left: Live Bracket Visualization */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden order-2 lg:order-1">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-3xl" />
              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE BRACKET
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                    Semi-Finals
                  </span>
                </div>

                {/* Mini Bracket Visualization */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left Side - Semi Finals */}
                    <div className="flex-1 space-y-3">
                      {/* Match 1 */}
                      <div className="bg-slate-800/80 rounded-lg p-2 border-l-2 border-emerald-500">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white font-medium">
                            Player A
                          </span>
                          <span className="text-emerald-400 font-bold">3</span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-slate-400">Player B</span>
                          <span className="text-slate-500">1</span>
                        </div>
                      </div>
                      {/* Match 2 */}
                      <div className="bg-slate-800/80 rounded-lg p-2 border-l-2 border-amber-500 relative">
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white font-medium">
                            Player C
                          </span>
                          <span className="text-amber-400 font-bold">2</span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-white font-medium">
                            Player D
                          </span>
                          <span className="text-amber-400 font-bold">2</span>
                        </div>
                        <div className="text-[9px] text-amber-400 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          In Progress
                        </div>
                      </div>
                    </div>

                    {/* Connector Lines */}
                    <div className="hidden sm:flex flex-col items-center justify-center w-8">
                      <div className="w-4 h-[1px] bg-slate-600" />
                      <div className="w-[1px] h-12 bg-slate-600" />
                      <div className="w-4 h-[1px] bg-slate-600" />
                    </div>

                    {/* Right Side - Final */}
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 rounded-lg p-3 border border-amber-500/20">
                        <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">
                          Final
                        </div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-emerald-400 font-medium">
                            Player A
                          </span>
                          <span className="text-slate-600">—</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">TBD</span>
                          <span className="text-slate-600">—</span>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-2">
                          Waiting...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bracket Types */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {["Single Elim", "Double Elim", "Round Robin", "Swiss"].map(
                    (type, i) => (
                      <span
                        key={type}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium ${
                          i === 0
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800/50 text-slate-500"
                        }`}
                      >
                        {type}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right: Feature Cards Stack */}
            <div className="space-y-4 order-1 lg:order-2">
              {/* Jumbotron Feature */}
              <div className="glass-card rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-sky-500/30 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1">
                      Jumbotron Mode
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 mb-2">
                      Cast live scores to the big screen. All courts, one view.
                    </p>
                    <div className="bg-slate-900 rounded-md px-2 py-1 text-[9px] text-slate-500 font-mono inline-block">
                      /live/tournament/abc123
                    </div>
                  </div>
                </div>
              </div>

              {/* Push Notifications */}
              <div className="glass-card rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 relative">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                      3
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1">
                      Smart Notifications
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 mb-2">
                      &quot;Court 3 ready! Report to your station.&quot;
                    </p>
                    <div className="flex gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px]">
                        Up Next
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px]">
                        Results
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px]">
                        Delays
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Sign-off */}
              <div className="glass-card rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1">
                      Digital Sign-off
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 mb-2">
                      Players confirm results on screen. No paper, no disputes.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Verified & Locked to Leaderboard
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases - Horizontal Scroll on Mobile */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 text-center">
              Perfect For
            </h3>
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-amber-500/5 to-transparent glass-card rounded-xl p-4 sm:p-5 border-amber-500/20 hover:border-amber-500/40 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Pub Leagues
                    </h4>
                    <p className="text-[10px] text-amber-400/80">
                      Darts • Pool
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  &quot;Run Tuesday nights without the whiteboard chaos&quot;
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-500/5 to-transparent glass-card rounded-xl p-4 sm:p-5 border-red-500/20 hover:border-red-500/40 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">🏎️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Sim Racing</h4>
                    <p className="text-[10px] text-red-400/80">
                      Esports Leagues
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  &quot;Track points across 10 races automatically&quot;
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/5 to-transparent glass-card rounded-xl p-4 sm:p-5 border-orange-500/20 hover:border-orange-500/40 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">🎾</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Sports Clubs
                    </h4>
                    <p className="text-[10px] text-orange-400/80">
                      Padel • Tennis
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  &quot;Professional championships with live bar displays&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Viral Hook - More Prominent */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-emerald-400 font-bold text-lg sm:text-xl">
                    1 Organizer = 32 Players
                  </span>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    Your growth engine
                  </p>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-slate-700 hidden sm:block" />
              <p className="text-xs sm:text-sm text-slate-300">
                Free tools that fill your venue
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progression & Badges Section */}
      <section className="py-12 sm:py-20 md:py-32 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-transparent to-transparent" />
        <div className="absolute top-1/3 right-0 sm:right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <svg
                className="w-5 h-5 text-amber-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm text-slate-300">Level Up Your Game</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-4">
              Earn <span className="text-amber-400">Badges</span> & Track Your{" "}
              <span className="gradient-text">Rating</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto">
              Our algorithm calculates your skill level. Complete challenges,
              unlock achievements, climb the ranks.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left: Skill Rating Card */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl" />
              <div className="relative">
                <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </span>
                  Skill Ratings
                </h3>

                {/* Multiple skill bars */}
                <div className="space-y-4">
                  {[
                    {
                      sport: "Sim Racing",
                      rating: 1847,
                      percent: 73,
                      tier: "Gold",
                      color: "from-red-500 to-orange-500",
                    },
                    {
                      sport: "Darts",
                      rating: 1562,
                      percent: 58,
                      tier: "Silver",
                      color: "from-sky-500 to-blue-500",
                    },
                    {
                      sport: "Padel",
                      rating: 1203,
                      percent: 35,
                      tier: "Bronze",
                      color: "from-orange-500 to-amber-500",
                    },
                  ].map((skill) => (
                    <div
                      key={skill.sport}
                      className="bg-slate-800/50 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white font-medium">
                          {skill.sport}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {skill.tier}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {skill.rating}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${skill.color} transition-all duration-1000`}
                          style={{ width: `${skill.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tier Legend */}
                <div className="flex justify-between mt-4 px-1">
                  {["Bronze", "Silver", "Gold", "Diamond"].map((tier, i) => (
                    <div key={tier} className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full mb-1 ${
                          i === 0
                            ? "bg-orange-600"
                            : i === 1
                            ? "bg-slate-400"
                            : i === 2
                            ? "bg-amber-400"
                            : "bg-sky-300"
                        }`}
                      />
                      <span className="text-[9px] text-slate-500">{tier}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Badges Grid */}
            <div className="lg:col-span-3 glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <span className="text-lg">🏆</span>
                    </span>
                    Achievements
                  </h3>
                  <span className="text-xs text-slate-500">12/48 Unlocked</span>
                </div>

                {/* Badge Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                  {[
                    {
                      name: "Speed Demon",
                      icon: "🏎️",
                      unlocked: true,
                      rarity: "rare",
                    },
                    {
                      name: "9-Dart Master",
                      icon: "🎯",
                      unlocked: true,
                      rarity: "epic",
                    },
                    {
                      name: "Ace Hunter",
                      icon: "⛳",
                      unlocked: true,
                      rarity: "common",
                    },
                    {
                      name: "Consistent",
                      icon: "📊",
                      unlocked: true,
                      rarity: "common",
                    },
                    {
                      name: "Night Owl",
                      icon: "🦉",
                      unlocked: true,
                      rarity: "rare",
                    },
                    {
                      name: "Hot Streak",
                      icon: "🔥",
                      unlocked: true,
                      rarity: "epic",
                    },
                    {
                      name: "Iron Will",
                      icon: "💪",
                      unlocked: false,
                      rarity: "legendary",
                    },
                    {
                      name: "Perfectionist",
                      icon: "✨",
                      unlocked: false,
                      rarity: "legendary",
                    },
                    {
                      name: "Team Player",
                      icon: "🤝",
                      unlocked: false,
                      rarity: "rare",
                    },
                    {
                      name: "Mentor",
                      icon: "🎓",
                      unlocked: false,
                      rarity: "epic",
                    },
                    {
                      name: "Champion",
                      icon: "👑",
                      unlocked: false,
                      rarity: "legendary",
                    },
                    {
                      name: "Legend",
                      icon: "⭐",
                      unlocked: false,
                      rarity: "legendary",
                    },
                  ].map((badge) => (
                    <div
                      key={badge.name}
                      className={`relative flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border transition-all group ${
                        badge.unlocked
                          ? badge.rarity === "legendary"
                            ? "bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/40 hover:border-amber-400"
                            : badge.rarity === "epic"
                            ? "bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/40 hover:border-purple-400"
                            : badge.rarity === "rare"
                            ? "bg-gradient-to-br from-sky-500/20 to-blue-600/20 border-sky-500/40 hover:border-sky-400"
                            : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                          : "bg-slate-900/50 border-slate-800 opacity-40"
                      }`}
                    >
                      <span
                        className={`text-xl sm:text-2xl ${
                          !badge.unlocked && "grayscale"
                        }`}
                      >
                        {badge.unlocked ? badge.icon : "🔒"}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 text-center leading-tight hidden sm:block">
                        {badge.name}
                      </span>
                      {badge.unlocked && badge.rarity === "legendary" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Recent Achievement */}
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <span className="text-xl">🔥</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-purple-400 font-medium">
                        Just Unlocked!
                      </p>
                      <p className="text-sm text-white font-semibold">
                        Hot Streak
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">2 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Spectator Section */}
      <section className="py-12 sm:py-20 md:py-32 relative overflow-hidden">
        {/* Broadcast-style background */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-red-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="text-sm text-red-400 font-medium">
                Live Streaming
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-4">
              Broadcast Your <span className="text-red-400">Match</span> Live
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto">
              Share a live link with anyone. They watch your scores update in
              real-time — no login required.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Main Live Preview Card */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-500/10 to-transparent blur-3xl" />

              <div className="relative">
                {/* Live Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold">
                        Live Spectator Mode
                      </h3>
                      <p className="text-xs text-slate-500">
                        Real-time score broadcasting
                      </p>
                    </div>
                  </div>

                  {/* Viewer Count */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-white">247</span>
                    <span className="text-xs text-slate-500">watching</span>
                  </div>
                </div>

                {/* Live Preview Mockup */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      <span className="text-xs text-red-400 font-medium uppercase tracking-wider">
                        Live
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Darts • Best of 5
                    </span>
                  </div>

                  {/* Score Display */}
                  <div className="flex items-center justify-center gap-8 py-4">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-lg font-bold text-primary">
                          JD
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">John Doe</p>
                      <p className="text-3xl font-bold text-white font-heading">
                        167
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-primary">2</span>
                      <span className="text-xs text-slate-600 my-1">—</span>
                      <span className="text-2xl font-bold text-secondary">
                        1
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-lg font-bold text-secondary">
                          MS
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">Mike Smith</p>
                      <p className="text-3xl font-bold text-white font-heading">
                        224
                      </p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="border-t border-slate-800 pt-3 mt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>
                        John threw{" "}
                        <span className="text-primary font-medium">
                          T20 T20 T20
                        </span>
                      </span>
                      <span className="ml-auto">Just now</span>
                    </div>
                  </div>
                </div>

                {/* Share Link */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <div className="flex-1 flex items-center gap-2 bg-slate-800 rounded-xl p-3 border border-slate-700">
                    <svg
                      className="w-5 h-5 text-slate-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span className="text-sm text-slate-400 truncate">
                      leaguesports.app/live/abc123xyz
                    </span>
                  </div>
                  <button className="px-6 py-3 rounded-xl bg-primary text-slate-950 font-semibold text-sm hover:bg-primary-light transition-colors flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    Share Link
                  </button>
                </div>

                {/* Features Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  {[
                    {
                      label: "Real-time Updates",
                      icon: "⚡",
                      desc: "Instant sync",
                    },
                    { label: "No Login", icon: "🔓", desc: "Just open link" },
                    { label: "Mobile Ready", icon: "📱", desc: "Any device" },
                    { label: "Chat & React", icon: "💬", desc: "Coming soon" },
                  ].map((feature) => (
                    <div
                      key={feature.label}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:border-primary/30 transition-colors"
                    >
                      <span className="text-xl mb-1 block">{feature.icon}</span>
                      <p className="text-xs text-white font-medium">
                        {feature.label}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sport-Specific Dashboard Tease */}
      <section className="py-16 sm:py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Tailored for <span className="gradient-text-alt">Your Sport</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
              Every sport gets a custom-designed dashboard. No generic
              interfaces — just the metrics and tools that matter to you.
            </p>
          </div>

          {/* Dashboard Switcher */}
          <div className="max-w-4xl mx-auto">
            {/* Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 rounded-xl glass-card">
                <button
                  onClick={() => setActiveDashboard("darts")}
                  className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeDashboard === "darts"
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🎯 Darts Dashboard
                </button>
                <button
                  onClick={() => setActiveDashboard("racing")}
                  className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeDashboard === "racing"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🏎️ Racing Dashboard
                </button>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              {/* Darts Dashboard */}
              <div
                className={`transition-all duration-500 ${
                  activeDashboard === "darts"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
                }`}
              >
                <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-sky-500/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                        <span className="text-xl">🎯</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white">
                          Darts Session Live
                        </h4>
                        <p className="text-xs text-slate-500">501 Double Out</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-medium">
                      Leg 3 of 5
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center p-4 rounded-xl bg-slate-800/50">
                      <p className="text-4xl sm:text-5xl font-bold text-sky-400 font-heading">
                        167
                      </p>
                      <p className="text-slate-500 text-sm mt-1">Remaining</p>
                      <p className="text-xs text-emerald-400 mt-2">
                        ✓ T20 → T19 → D25
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-800/50">
                      <p className="text-4xl sm:text-5xl font-bold text-white font-heading">
                        87.4
                      </p>
                      <p className="text-slate-500 text-sm mt-1">3-Dart Avg</p>
                      <p className="text-xs text-primary mt-2">
                        ↑ 4.2 vs last game
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "180s", value: "2" },
                      { label: "140+", value: "5" },
                      { label: "100+", value: "8" },
                      { label: "Checkout %", value: "42%" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-2 rounded-lg bg-slate-800/30"
                      >
                        <p className="text-lg font-bold text-white">
                          {stat.value}
                        </p>
                        <p className="text-xs text-slate-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Racing Dashboard */}
              <div
                className={`transition-all duration-500 ${
                  activeDashboard === "racing"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
                }`}
              >
                <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-red-500/20 bg-slate-950/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <span className="text-xl">🏎️</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white">
                          ACC Practice Session
                        </h4>
                        <p className="text-xs text-slate-500">
                          Monza • GT3 • Dry
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Connected
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <p className="text-xs text-slate-500 mb-1">Best Lap</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary font-mono">
                        1:47.234
                      </p>
                      <p className="text-xs text-emerald-400 mt-1">-0.342 PB</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <p className="text-xs text-slate-500 mb-1">Last Lap</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
                        1:48.012
                      </p>
                      <p className="text-xs text-amber-400 mt-1">+0.778</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <p className="text-xs text-slate-500 mb-1">Consistency</p>
                      <p className="text-2xl sm:text-3xl font-bold text-sky-400 font-mono">
                        98.2%
                      </p>
                      <p className="text-xs text-slate-400 mt-1">12 laps</p>
                    </div>
                  </div>

                  {/* Tire temps visualization */}
                  <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700">
                    <p className="text-xs text-slate-500 mb-3">
                      Tire Temperatures
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded bg-amber-500/20 border border-amber-500/30">
                        <p className="text-xs text-slate-400">FL</p>
                        <p className="text-sm font-mono text-amber-400">94°C</p>
                      </div>
                      <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/30">
                        <p className="text-xs text-slate-400">FR</p>
                        <p className="text-sm font-mono text-emerald-400">
                          91°C
                        </p>
                      </div>
                      <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/30">
                        <p className="text-xs text-slate-400">RL</p>
                        <p className="text-sm font-mono text-emerald-400">
                          88°C
                        </p>
                      </div>
                      <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/30">
                        <p className="text-xs text-slate-400">RR</p>
                        <p className="text-sm font-mono text-emerald-400">
                          87°C
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Ecosystem - Controllers & Displays */}
      <section className="py-12 sm:py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs sm:text-sm text-slate-300">
                Hardware Integration
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              The Ultimate Setup:{" "}
              <span className="gradient-text">Controllers & Displays</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto px-2">
              Turn any tablet into a professional input controller and any TV
              into a live-updating broadcast scoreboard. Using real-time sync,
              your devices work together to create a stadium experience at home.
            </p>
          </div>

          {/* Device Cards with Connection */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connection Line - Desktop (horizontal) */}
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 z-10">
                {/* Center sync indicator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-slate-900 border-2 border-accent flex items-center justify-center shadow-lg shadow-accent/20">
                  <div className="relative">
                    <svg
                      className="w-6 h-6 text-accent animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                </div>
                {/* Animated data packets - left to right */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary opacity-30" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"
                  style={{
                    animation: "slideRight 2s ease-in-out infinite",
                    left: "-6px",
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-secondary shadow-lg shadow-secondary/50"
                  style={{
                    animation: "slideLeft 2s ease-in-out infinite",
                    right: "-6px",
                  }}
                />
              </div>

              {/* Connection Line - Mobile (vertical between cards) */}
              <div className="md:hidden flex flex-col items-center py-4">
                <div className="hidden" />{" "}
                {/* Placeholder for grid alignment */}
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-16">
                {/* Controller - Tablet */}
                <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/20 to-transparent blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/30">
                        <svg
                          className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold font-heading">
                          Controller Mode
                        </h3>
                        <p className="text-xs text-primary">Tablet / Phone</p>
                      </div>
                    </div>
                    <p className="text-slate-400 mb-4 text-sm">
                      Tap scores on your device. Large buttons, instant
                      feedback.
                    </p>
                    {/* Mini tablet mockup */}
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-700">
                      <div className="grid grid-cols-3 gap-2">
                        {[20, 19, 18, 17, 16, 15].map((num) => (
                          <button
                            key={num}
                            className="py-2 rounded-lg bg-slate-800 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium">
                          Double
                        </button>
                        <button className="flex-1 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium">
                          Triple
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Sync Indicator */}
                <div className="md:hidden flex items-center justify-center gap-3 py-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary to-accent" />
                  <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-accent flex items-center justify-center shadow-lg shadow-accent/20">
                    <svg
                      className="w-5 h-5 text-accent animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-accent via-secondary to-transparent" />
                </div>

                {/* Display - TV */}
                <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-secondary/50 transition-all">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-secondary/20 to-transparent blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-secondary to-rose-600 flex items-center justify-center shadow-lg shadow-secondary/30">
                        <svg
                          className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold font-heading">
                          Display Mode
                        </h3>
                        <p className="text-xs text-secondary">TV / Monitor</p>
                      </div>
                    </div>
                    <p className="text-slate-400 mb-4 text-sm">
                      Live scoreboard updates instantly. Stadium feel at home.
                    </p>
                    {/* Mini TV mockup */}
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-500">LIVE</span>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-center flex-1">
                          <p className="text-xs text-slate-500">Player 1</p>
                          <p className="text-2xl font-bold text-primary font-heading">
                            301
                          </p>
                        </div>
                        <div className="text-slate-600 font-bold">vs</div>
                        <div className="text-center flex-1">
                          <p className="text-xs text-slate-500">Player 2</p>
                          <p className="text-2xl font-bold text-secondary font-heading">
                            256
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Status Badge */}
            <div className="flex justify-center mt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs sm:text-sm text-accent font-medium">
                  Real-time sync across all devices
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-16 sm:py-20 md:py-32 relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Simple to <span className="gradient-text">Get Started</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
              Set up in minutes. Start tracking and improving right away.
            </p>
          </div>

          {/* Steps - Vertical on mobile, Horizontal on desktop */}
          <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-4 md:gap-8 relative">
            {/* Connection line - only on desktop */}
            <div className="hidden md:block absolute top-10 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-[2px] bg-gradient-to-r from-primary via-accent to-secondary" />

            {[
              {
                step: "1",
                title: "Sign Up Free",
                description: "Create your account in seconds",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                ),
              },
              {
                step: "2",
                title: "Pick Your Sports",
                description: "Select the sports you play",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                ),
              },
              {
                step: "3",
                title: "Start Playing",
                description: "Track matches and practice",
                icon: (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </>
                ),
              },
              {
                step: "4",
                title: "See Progress",
                description: "Watch yourself improve over time",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                ),
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="flex md:flex-col items-center md:items-center gap-4 md:gap-0 md:text-center"
              >
                {/* Step number circle */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full glass-card border-2 border-primary/50 flex items-center justify-center relative z-10">
                    <svg
                      className="w-7 h-7 md:w-8 md:h-8 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  {/* Mobile vertical line */}
                  {index < 3 && (
                    <div className="md:hidden absolute left-1/2 top-full w-[2px] h-8 bg-gradient-to-b from-primary/50 to-transparent -translate-x-1/2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 md:mt-5">
                  <div className="flex items-center gap-2 md:justify-center mb-1">
                    <span className="text-xs font-bold text-primary/70">
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-heading text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Everything You Need to{" "}
              <span className="gradient-text-alt">Improve</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
              Tools designed to help you track progress, stay motivated, and
              connect with others who share your passion
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "Everything in One Place",
                description:
                  "See all your sports, recent games, and progress at a glance",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                ),
              },
              {
                title: "Made for Your Sport",
                description:
                  "Golf, padel, racing — each sport works exactly how you'd expect it to",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                ),
              },
              {
                title: "Detailed Analytics",
                description:
                  "Track your improvement with charts, trends, and performance insights",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                ),
              },
              {
                title: "Achievements & Goals",
                description:
                  "Earn achievements, set weekly goals, and unlock milestones as you play",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                ),
              },
              {
                title: "Communities",
                description:
                  "Join or create groups to play with friends, run tournaments, and compete",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                ),
              },
              {
                title: "Cross-Platform",
                description:
                  "Play on any device—your data syncs seamlessly everywhere",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="feature-card glass-card rounded-2xl p-6 md:p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mb-5">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/20 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Coming Soon
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
                Ready to Transform How You Play?
              </h2>
              <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-6 sm:mb-8 px-2">
                Join thousands of players who want a better way to track their
                progress and enjoy their favorite sports. Sign up for early
                access.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span>Join the Waitlist</span>
                </Link>
                <a
                  href="#sports"
                  className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg w-full sm:w-auto"
                >
                  Explore Sports
                </a>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-4 sm:mt-6">
                No spam, ever. We&apos;ll only email you about launch updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <span className="text-slate-950 font-bold text-base sm:text-lg">
                    L
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold font-heading">
                  League<span className="gradient-text">Sports</span>
                </span>
              </Link>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xs mb-3 sm:mb-4">
                Your ultimate sports companion. Track, practice, and compete
                across all your favorite activities in one place.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-slate-400 hover:text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sports</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {sportsList.map((sport) => (
                  <li key={sport.id}>{sport.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="#sports"
                    className="hover:text-primary transition-colors"
                  >
                    Browse Sports
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-primary transition-colors"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} LeagueSports. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
