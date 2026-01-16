import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tournaments & Leagues - Professional Bracket Management",
  description:
    "Run professional tournaments with live brackets, automatic scheduling, and multiple formats. Single elimination, double elimination, round robin, and Swiss system support.",
  keywords: [
    "tournament bracket software",
    "league management system",
    "sports tournament organizer",
    "bracket generator",
    "round robin tournament",
    "Swiss system tournament",
  ],
  openGraph: {
    title: "Tournaments & Leagues | LeagueSports",
    description:
      "Professional tournament management for any sport. Live brackets, smart scheduling, and seamless organization.",
  },
};

const formats = [
  {
    name: "Single Elimination",
    description: "Classic knockout format. Lose once, you're out.",
    icon: "🏆",
    bestFor: "Quick tournaments, playoffs",
  },
  {
    name: "Double Elimination",
    description: "Two chances to compete. Losers bracket gives second life.",
    icon: "🔄",
    bestFor: "Competitive events, fair seeding",
  },
  {
    name: "Round Robin",
    description: "Everyone plays everyone. Most points wins.",
    icon: "🔁",
    bestFor: "League play, group stages",
  },
  {
    name: "Swiss System",
    description:
      "Play opponents with similar records. Efficient for large groups.",
    icon: "🎲",
    bestFor: "Large tournaments, time-limited events",
  },
];

const features = [
  {
    title: "Live Brackets",
    description:
      "Real-time bracket updates as matches complete. Participants and spectators always know what's happening.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
        />
      </svg>
    ),
  },
  {
    title: "Smart Notifications",
    description:
      "Players get alerts when it's their turn. No more hunting for your next match.",
    icon: (
      <svg
        className="w-6 h-6"
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
    ),
  },
  {
    title: "Digital Sign-off",
    description:
      "Players confirm results on screen. No paper, no disputes, automatically locked.",
    icon: (
      <svg
        className="w-6 h-6"
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
    ),
  },
  {
    title: "Seeding Options",
    description:
      "Random draw, rating-based, or manual seeding. Control how players are placed.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
        />
      </svg>
    ),
  },
  {
    title: "Check-in System",
    description:
      "Require players to confirm attendance before start. Auto-remove no-shows.",
    icon: (
      <svg
        className="w-6 h-6"
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
    ),
  },
  {
    title: "Prize Management",
    description:
      "Track and display prizes. Make the stakes clear from the start.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export default function TournamentsPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🏆</span>
                <span className="text-sm text-slate-300">
                  Tournaments & Leagues
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Run <span className="text-emerald-400">Professional</span>{" "}
                Events
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                From pub leagues to esports championships. One platform with
                live brackets, automatic scheduling, and everything you need to
                run seamless competitions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 py-3 rounded-full text-base"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/solutions/organizers"
                  className="btn-secondary px-6 py-3 rounded-full text-base"
                >
                  For Organizers
                </Link>
              </div>
            </div>

            {/* Bracket Preview */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-3xl" />
              <div className="relative">
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

                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
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
                    <div className="hidden sm:flex flex-col items-center justify-center w-8">
                      <div className="w-4 h-px bg-slate-600" />
                      <div className="w-px h-12 bg-slate-600" />
                      <div className="w-4 h-px bg-slate-600" />
                    </div>
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Every Format You Need
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choose the perfect tournament structure for your event. Mix and
              match formats for group stages and playoffs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {formats.map((format) => (
              <div
                key={format.name}
                className="glass-card rounded-xl p-5 hover:border-emerald-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{format.icon}</div>
                <h3 className="font-bold text-white mb-2">{format.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {format.description}
                </p>
                <div className="text-xs text-emerald-400">
                  Best for: {format.bestFor}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Built for Organizers
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to run professional events without the
              spreadsheet chaos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center text-emerald-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Perfect For
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Pub Leagues</h4>
                  <p className="text-xs text-amber-400/80">Darts • Pool</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Run Tuesday nights without the whiteboard chaos&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20 hover:border-red-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏎️</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Sim Racing</h4>
                  <p className="text-xs text-red-400/80">Esports Leagues</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Track points across 10 races automatically&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎾</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Sports Clubs</h4>
                  <p className="text-xs text-orange-400/80">Padel • Tennis</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Professional championships with live bar displays&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to run your first tournament?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Get our &quot;Digital Commissioner&quot; toolkit free during
                early access. Brackets, scheduling, and live displays included.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition-colors"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Claim Free Organizer Access
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
