import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.squash;

export const metadata: Metadata = {
  title: "Squash South Africa - Leagues, Tournaments & Match Tracking",
  description:
    "South Africa's squash community platform. Join club leagues, track your matches, find opponents, and compete in tournaments nationwide.",
  alternates: { canonical: "/sports/squash" },
  keywords: [
    "squash South Africa",
    "squash leagues SA",
    "squash Johannesburg",
    "squash Cape Town",
    "squash tournaments SA",
    "squash ranking South Africa",
    "club squash SA",
  ],
  openGraph: {
    title: "Squash South Africa - Leagues, Tournaments & Match Tracking",
    description:
      "South Africa's squash community platform. Join leagues and track your matches.",
    url: "https://leaguesports.co.za/sports/squash",
  },
};

const matchFormats = [
  {
    name: "Best of 5",
    description: "Traditional format. First to 11, win by 2.",
    icon: "🏆",
    bestFor: "Competitive matches, tournaments",
  },
  {
    name: "Best of 3",
    description: "Shorter format for league play.",
    icon: "⚡",
    bestFor: "League matches, time-limited",
  },
  {
    name: "PAR Scoring",
    description: "Point-a-rally to 15. Fast and exciting.",
    icon: "🎯",
    bestFor: "Social play, quick games",
  },
  {
    name: "Box Leagues",
    description: "Small groups play each other over weeks.",
    icon: "📊",
    bestFor: "Club leagues, ongoing competition",
  },
];

const features = [
  {
    icon: "📱",
    title: "Live Scoring",
    description:
      "Point-by-point scoring with rally tracking. Let winners and errors logged automatically.",
  },
  {
    icon: "📊",
    title: "Performance Stats",
    description:
      "Track winners, errors, and rally lengths. See your game improve over time.",
  },
  {
    icon: "👥",
    title: "Opponent Finder",
    description:
      "Find players at your level near you. Challenge and schedule matches easily.",
  },
  {
    icon: "🏆",
    title: "Box Leagues",
    description:
      "Run club box leagues with automatic scheduling, results, and promotion/relegation.",
  },
  {
    icon: "📈",
    title: "Skill Ratings",
    description:
      "ELO-based rating system. Know exactly where you stand at your club and nationally.",
  },
  {
    icon: "📅",
    title: "Court Booking",
    description:
      "Integrated booking. Schedule matches and reserve courts in one place.",
  },
];

const venues = [
  { name: "Wanderers Club", location: "Illovo, JHB", courts: 6 },
  { name: "Kelvin Grove", location: "Cape Town", courts: 5 },
  { name: "Old Eds Club", location: "Houghton, JHB", courts: 4 },
  { name: "Durban Country Club", location: "Durban", courts: 4 },
  { name: "Brooklyn Pretoria Club", location: "Pretoria", courts: 5 },
  { name: "Western Province CC", location: "Cape Town", courts: 4 },
];

export default function SquashPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🎾</span>
                <span className="text-sm text-slate-300">
                  SA Squash Community 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Squash in{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-teal-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                Join box leagues, find opponents, and track your progress. From
                club squash to competitive tournaments, we&apos;ve got you
                covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 py-3 rounded-full text-base text-center"
                >
                  Join the Waitlist
                </Link>
                <Link
                  href="/about"
                  className="btn-secondary px-6 py-3 rounded-full text-base text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Live Match Card */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE MATCH
                    </span>
                  </div>
                  <span className="text-xs text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded-full">
                    Game 4
                  </span>
                </div>

                {/* Score Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500 mb-1">Player 1</p>
                      <p className="text-sm text-white font-medium mb-2">
                        R. Thompson
                      </p>
                      <div className="flex justify-center gap-2">
                        <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                          11
                        </span>
                        <span className="w-6 h-6 rounded bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
                          9
                        </span>
                        <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                          11
                        </span>
                        <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                          8
                        </span>
                      </div>
                    </div>
                    <div className="px-4 text-center">
                      <p className="text-2xl font-bold">
                        <span className="text-cyan-400">3</span>
                        <span className="text-slate-600 mx-2">-</span>
                        <span className="text-white">1</span>
                      </p>
                      <p className="text-xs text-slate-500">Games</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500 mb-1">Player 2</p>
                      <p className="text-sm text-white font-medium mb-2">
                        S. Naidoo
                      </p>
                      <div className="flex justify-center gap-2">
                        <span className="w-6 h-6 rounded bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
                          8
                        </span>
                        <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                          11
                        </span>
                        <span className="w-6 h-6 rounded bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
                          7
                        </span>
                        <span className="w-6 h-6 rounded bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
                          6
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Winners", p1: "18", p2: "12" },
                    { label: "Errors", p1: "8", p2: "14" },
                    { label: "Rally Avg", p1: "12", p2: "10" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-2 rounded-lg bg-slate-800/50"
                    >
                      <div className="text-[10px] text-slate-500 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs">
                        <span className="text-cyan-400">{stat.p1}</span>
                        <span className="text-slate-600 mx-1">-</span>
                        <span className="text-white">{stat.p2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "8,200+", label: "Players" },
              { value: "42K+", label: "Matches Logged" },
              { value: "180+", label: "Clubs" },
              { value: "65+", label: "Box Leagues" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Match Formats */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Every Match Format
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From box leagues to tournaments. We support every squash format.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matchFormats.map((format) => (
              <div
                key={format.name}
                className="glass-card rounded-xl p-5 hover:border-cyan-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{format.icon}</div>
                <h3 className="font-bold text-white mb-2">{format.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {format.description}
                </p>
                <div className="text-xs text-cyan-400">
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
              Built for Squash
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything South African squash players and clubs need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-600/20 flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Perfect For
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-cyan-500/5 to-transparent border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎾</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Club Players</h4>
                  <p className="text-xs text-cyan-400/80">Track your game</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Box leagues run automatically. Just play and log results.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Squash Clubs</h4>
                  <p className="text-xs text-teal-400/80">Manage leagues</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Promotion and relegation sorted automatically each month.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Competitive Players</h4>
                  <p className="text-xs text-emerald-400/80">Climb the ranks</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Can track my rating across all clubs I play at.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-sky-500/5 to-transparent border-sky-500/20 hover:border-sky-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Spectators</h4>
                  <p className="text-xs text-sky-400/80">Follow live matches</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Watch box league progress from the gallery. Live scores
                on screen.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Venues Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Squash Clubs in SA
            </h2>
            <p className="text-slate-400">
              Connect with clubs across South Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-cyan-500/30 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-bold">
                  {venue.courts}
                </div>
                <div>
                  <div className="font-medium text-white">{venue.name}</div>
                  <div className="text-sm text-slate-400">{venue.location}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-slate-500">
              + 180 squash clubs across all provinces
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Hit the Court?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join South Africa&apos;s squash community. Find opponents, join
                box leagues, and track your progress.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Join the Waitlist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other Sports */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-white text-center mb-8">
            Explore Other Sports
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {sportsList
              .filter((s) => s.slug !== "squash")
              .map((otherSport) => (
                <Link
                  key={otherSport.slug}
                  href={`/sports/${otherSport.slug}`}
                  className="glass-card rounded-lg px-4 py-2 hover:border-slate-600 transition-colors flex items-center gap-2"
                >
                  <div
                    className={`w-6 h-6 rounded bg-gradient-to-br ${otherSport.gradient} flex items-center justify-center`}
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={otherSport.icon}
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-white">{otherSport.name}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
