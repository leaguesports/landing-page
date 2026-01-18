import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.tennis;

export const metadata: Metadata = {
  title: "Tennis South Africa - Leagues, Tournaments & Match Tracking",
  description:
    "South Africa's tennis community platform. Join leagues, find hitting partners, track your matches, and compete in tournaments at clubs nationwide.",
  alternates: { canonical: "/sports/tennis" },
  keywords: [
    "tennis South Africa",
    "tennis leagues SA",
    "tennis Johannesburg",
    "tennis Cape Town",
    "tennis tournaments SA",
    "tennis ranking South Africa",
    "club tennis SA",
    "tennis partner finder",
  ],
  openGraph: {
    title: "Tennis South Africa - Leagues, Tournaments & Match Tracking",
    description:
      "South Africa's tennis community platform. Join leagues and track your matches.",
    url: "https://leaguesports.co.za/sports/tennis",
  },
};

const matchFormats = [
  {
    name: "Singles",
    description: "One-on-one competition. Best of 3 or 5 sets.",
    icon: "🎾",
    bestFor: "Competitive play, ranking matches",
  },
  {
    name: "Doubles",
    description: "Team tennis. Pairs compete together.",
    icon: "👥",
    bestFor: "Social tennis, mixed events",
  },
  {
    name: "Tiebreak Sets",
    description: "First to 10 with tiebreak. Faster format.",
    icon: "⚡",
    bestFor: "League play, time-limited",
  },
  {
    name: "Round Robin",
    description: "Everyone plays everyone. Points accumulate.",
    icon: "🔄",
    bestFor: "Club championships, social events",
  },
];

const features = [
  {
    icon: "📱",
    title: "Live Scoring",
    description:
      "Point-by-point scoring with game, set, and match tracking. Real-time updates for spectators.",
  },
  {
    icon: "📊",
    title: "Performance Stats",
    description:
      "Track aces, double faults, winners, and unforced errors. Serve percentages and more.",
  },
  {
    icon: "👥",
    title: "Partner Finder",
    description:
      "Find players at your level near you. Filter by skill, availability, and location.",
  },
  {
    icon: "🏆",
    title: "Club Leagues",
    description:
      "Run club ladders and leagues with automatic scheduling and standings.",
  },
  {
    icon: "📈",
    title: "Skill Ratings",
    description:
      "ELO-based rating system. Know exactly where you stand against other players.",
  },
  {
    icon: "📅",
    title: "Court Booking",
    description:
      "Integrated with club booking systems. Schedule matches and reserve courts.",
  },
];

const venues = [
  { name: "Wanderers Tennis Club", location: "Illovo, JHB", courts: 12 },
  { name: "Kelvin Grove", location: "Cape Town", courts: 8 },
  { name: "Montecasino Tennis", location: "Fourways, JHB", courts: 6 },
  { name: "Durban Country Club", location: "Durban", courts: 10 },
  { name: "Pretoria Tennis Club", location: "Pretoria", courts: 8 },
  { name: "Stellenbosch Tennis Club", location: "Stellenbosch", courts: 6 },
];

export default function TennisPage() {
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
                  SA Tennis Community 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Tennis in{" "}
                <span className="bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                Find hitting partners, join club leagues, and track your matches.
                From social tennis to competitive play, connect with the SA
                tennis community.
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-lime-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE MATCH
                    </span>
                  </div>
                  <span className="text-xs text-lime-400 px-2 py-0.5 bg-lime-500/10 rounded-full">
                    3rd Set
                  </span>
                </div>

                {/* Score Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-lime-400" />
                        <span className="text-sm text-white font-medium">
                          J. van der Berg
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm font-mono">
                        <span className="text-lime-400 font-bold">6</span>
                        <span className="text-white">4</span>
                        <span className="text-lime-400 font-bold">5</span>
                        <span className="w-8 text-center text-lime-400 bg-lime-500/20 rounded">
                          40
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-transparent" />
                        <span className="text-sm text-slate-400">
                          M. Patel
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm font-mono">
                        <span className="text-white">4</span>
                        <span className="text-lime-400 font-bold">6</span>
                        <span className="text-white">4</span>
                        <span className="w-8 text-center text-white bg-slate-700 rounded">
                          30
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Stats Preview */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Aces", p1: "8", p2: "4" },
                    { label: "Winners", p1: "24", p2: "18" },
                    { label: "1st Serve %", p1: "68%", p2: "61%" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-2 rounded-lg bg-slate-800/50"
                    >
                      <div className="text-[10px] text-slate-500 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs">
                        <span className="text-lime-400">{stat.p1}</span>
                        <span className="text-slate-600 mx-1">-</span>
                        <span className="text-white">{stat.p2}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-lime-500/10 border border-lime-500/20">
                  <div className="text-xs text-lime-400">
                    🎾 Van der Berg serving for the match
                  </div>
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
              { value: "18,500+", label: "Players" },
              { value: "65K+", label: "Matches Logged" },
              { value: "320+", label: "Clubs" },
              { value: "85+", label: "Leagues" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-lime-400">
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
              Singles, doubles, or round robins. Track every format at your club.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matchFormats.map((format) => (
              <div
                key={format.name}
                className="glass-card rounded-xl p-5 hover:border-lime-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{format.icon}</div>
                <h3 className="font-bold text-white mb-2">{format.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {format.description}
                </p>
                <div className="text-xs text-lime-400">
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
              Built for Tennis
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything South African tennis players and clubs need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500/20 to-green-600/20 flex items-center justify-center text-2xl mb-4">
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
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-lime-500/5 to-transparent border-lime-500/20 hover:border-lime-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎾</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Club Players</h4>
                  <p className="text-xs text-lime-400/80">Track your game</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Finally found regular hitting partners at my level.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20 hover:border-green-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Tennis Clubs</h4>
                  <p className="text-xs text-green-400/80">Run leagues</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Our club ladder updates automatically. Members love it.&quot;
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
                &quot;The rating system shows me exactly where I stand in SA.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Tennis Fans</h4>
                  <p className="text-xs text-teal-400/80">Live match tracking</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Follow club championships point-by-point. Love the live
                updates.&quot;
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
              Tennis Clubs in SA
            </h2>
            <p className="text-slate-400">
              Connect with clubs across South Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-lime-500/30 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center text-white font-bold">
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
              + 320 tennis clubs across all provinces
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Serve Up?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join South Africa&apos;s tennis community. Find partners, join
                leagues, and track every ace.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-lime-500 to-green-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
              .filter((s) => s.slug !== "tennis")
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
