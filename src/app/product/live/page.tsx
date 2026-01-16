"use client";

import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";

export default function LiveModePage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="text-sm text-slate-300">Live Mode</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
              Create That <span className="text-sky-400">Pro</span> Atmosphere
            </h1>
            <p className="text-lg sm:text-xl text-slate-400">
              Cast scores to big screens, enable spectator views, and make every
              match feel like a championship.
            </p>
          </div>
        </div>
      </section>

      {/* Live Bracket Visualization */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Live Bracket Visualization */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden">
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
                      <div className="w-4 h-px bg-slate-600" />
                      <div className="w-px h-12 bg-slate-600" />
                      <div className="w-4 h-px bg-slate-600" />
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
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-4xl font-bold font-heading mb-6">
                Live <span className="text-emerald-400">Tournament</span> Views
              </h2>

              {/* Jumbotron Feature */}
              <div className="glass-card rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-sky-500/30 transition-all">
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

              {/* Smart Notifications */}
              <div className="glass-card rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Sign-off */}
              <div className="glass-card rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
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
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Both players confirm results on screen. No disputes, no
                      paperwork.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
                    📺
                  </span>
                  Jumbotron Mode
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Cast live scores to TVs and big screens. Show all courts at
                  once or focus on a single match.
                </p>
                <div className="bg-slate-900/50 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500 font-mono">
                    /live/tournament/abc123
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    👀
                  </span>
                  Spectator View
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Share a link for remote viewers. Friends and fans can follow
                  live without an account.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs">
                    Real-time
                  </span>
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">
                    No login required
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🖥️",
                title: "Multi-Display Support",
                description:
                  "Show different content on each screen. Brackets, scores, schedules.",
              },
              {
                icon: "🔄",
                title: "Real-time Updates",
                description: "Scores update instantly. No refresh needed.",
              },
              {
                icon: "🎨",
                title: "Customizable Themes",
                description:
                  "Match your venue or brand colors. Light and dark modes.",
              },
              {
                icon: "📱",
                title: "Mobile Control",
                description:
                  "Control displays from your phone. Change views on the fly.",
              },
              {
                icon: "🔗",
                title: "Shareable Links",
                description:
                  "One link per event. Share to social, embed on websites.",
              },
              {
                icon: "📊",
                title: "Stats Overlay",
                description:
                  "Show player stats, match history, and rankings on screen.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connected Devices Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-slate-300">
                Hardware Integration
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Controllers & <span className="gradient-text">Displays</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto px-2">
              Turn any tablet into a professional input controller and any TV
              into a live-updating broadcast scoreboard. Real-time sync keeps
              everything in perfect harmony.
            </p>
          </div>

          {/* Device Cards with Connection */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connection Line - Desktop (horizontal) */}
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 z-10">
                {/* Center sync indicator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/20">
                  <div className="relative">
                    <svg
                      className="w-6 h-6 text-cyan-400 animate-pulse"
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
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-500 opacity-30" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-sky-500 shadow-lg shadow-sky-500/50"
                  style={{
                    animation: "slideRight 2s ease-in-out infinite",
                    left: "-6px",
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                  style={{
                    animation: "slideLeft 2s ease-in-out infinite",
                    right: "-6px",
                  }}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-16">
                {/* Controller - Tablet */}
                <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-sky-500/50 transition-all">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-sky-500/20 to-transparent blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
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
                            d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold font-heading">
                          Controller Mode
                        </h3>
                        <p className="text-xs text-sky-400">Tablet / Phone</p>
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
                            className="py-2 rounded-lg bg-slate-800 text-sky-400 font-bold text-sm hover:bg-sky-500/20 transition-colors"
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
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-500 to-cyan-400" />
                  <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/20">
                    <svg
                      className="w-5 h-5 text-cyan-400 animate-pulse"
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
                  <div className="h-px flex-1 bg-gradient-to-r from-cyan-400 via-emerald-500 to-transparent" />
                </div>

                {/* Display - TV */}
                <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/20 to-transparent blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
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
                        <p className="text-xs text-emerald-400">TV / Monitor</p>
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
                          <p className="text-2xl font-bold text-sky-400 font-heading">
                            301
                          </p>
                        </div>
                        <div className="text-slate-600 font-bold">vs</div>
                        <div className="text-center flex-1">
                          <p className="text-xs text-slate-500">Player 2</p>
                          <p className="text-2xl font-bold text-emerald-400 font-heading">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs sm:text-sm text-cyan-400 font-medium">
                  Real-time sync across all devices
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CSS for animations */}
        <style jsx>{`
          @keyframes slideRight {
            0%,
            100% {
              transform: translateY(-50%) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-50%) translateX(96px);
              opacity: 0;
            }
          }
          @keyframes slideLeft {
            0%,
            100% {
              transform: translateY(-50%) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-50%) translateX(-96px);
              opacity: 0;
            }
          }
        `}</style>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
            Make every match feel like a championship
          </h2>
          <p className="text-slate-400 mb-8">
            Turn your venue into a professional sports arena.
          </p>
          <Link
            href="/waitlist"
            className="btn-primary px-8 py-4 rounded-full text-base"
          >
            Get Early Access
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
