import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.bowling;

export const metadata: Metadata = {
  title: "Tenpin Bowling South Africa - Leagues, Tournaments & Scoring",
  description:
    "South Africa's bowling community. Join leagues, track your average, compete in tournaments, and connect with bowlers at alleys nationwide.",
  alternates: { canonical: "/sports/bowling" },
  keywords: [
    "bowling South Africa",
    "tenpin bowling SA",
    "bowling leagues Johannesburg",
    "bowling Cape Town",
    "bowling tournaments SA",
    "bowling average tracker",
    "bowling alleys South Africa",
  ],
  openGraph: {
    title: "Tenpin Bowling South Africa - Leagues, Tournaments & Scoring",
    description:
      "South Africa's bowling community. Join leagues and track your average.",
    url: "https://leaguesports.co.za/sports/bowling",
  },
};

const leagueFormats = [
  {
    name: "Classic League",
    description: "3-game series with handicap. Team-based competition.",
    icon: "🎳",
    bestFor: "Weekly leagues, clubs",
  },
  {
    name: "Scratch League",
    description: "No handicap. Pure skill competition.",
    icon: "⚡",
    bestFor: "Competitive bowlers",
  },
  {
    name: "Baker Format",
    description: "5 bowlers rotate through frames. Team bowling.",
    icon: "👥",
    bestFor: "Team events, tournaments",
  },
  {
    name: "Scotch Doubles",
    description: "Pairs alternate frames. Fun team format.",
    icon: "🤝",
    bestFor: "Social events, couples",
  },
];

const features = [
  {
    icon: "📊",
    title: "Average Tracking",
    description:
      "Track your average across all leagues and sessions. Watch your improvement over time.",
  },
  {
    icon: "🎳",
    title: "Game Scoring",
    description:
      "Frame-by-frame scoring with strike and spare tracking. Automatic handicap calculation.",
  },
  {
    icon: "📈",
    title: "Performance Stats",
    description:
      "Strike percentage, spare conversion, split pickups, and pin counts by position.",
  },
  {
    icon: "🏆",
    title: "League Management",
    description:
      "Run leagues with standings, handicaps, and automatic scheduling.",
  },
  {
    icon: "📺",
    title: "Lane Display",
    description:
      "Show live standings on alley screens. Professional tournament atmosphere.",
  },
  {
    icon: "🎖️",
    title: "Achievements",
    description:
      "Celebrate 200+ games, perfect games, and personal bests with badges.",
  },
];

const venues = [
  { name: "Zone Bowling Fourways", location: "Fourways, JHB", lanes: 24 },
  { name: "The Curve Bowling", location: "Rivonia, JHB", lanes: 16 },
  { name: "Grand West Bowling", location: "Cape Town", lanes: 20 },
  { name: "Gateway Bowling", location: "Umhlanga, DBN", lanes: 18 },
  { name: "Randridge Mall Bowling", location: "Randburg, JHB", lanes: 12 },
  { name: "V&A Waterfront Bowling", location: "Cape Town", lanes: 14 },
];

export default function BowlingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🎳</span>
                <span className="text-sm text-slate-300">
                  SA Bowling Community 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Bowling in{" "}
                <span className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                Join leagues, track your average, and compete in tournaments.
                From casual bowlers to competitive players, connect with SA&apos;s
                bowling community.
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

            {/* Scorecard Preview */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      GAME 3 OF 3
                    </span>
                  </div>
                  <span className="text-xs text-rose-400 px-2 py-0.5 bg-rose-500/10 rounded-full">
                    Frame 8
                  </span>
                </div>

                {/* Score Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white font-medium">
                      Current Game
                    </span>
                    <span className="text-2xl font-bold text-rose-400">168</span>
                  </div>

                  {/* Frame Boxes */}
                  <div className="flex gap-1 overflow-x-auto pb-2">
                    {[
                      { f1: "X", f2: "", score: 28 },
                      { f1: "8", f2: "/", score: 47 },
                      { f1: "X", f2: "", score: 67 },
                      { f1: "X", f2: "", score: 87 },
                      { f1: "7", f2: "2", score: 96 },
                      { f1: "X", f2: "", score: 126 },
                      { f1: "X", f2: "", score: 146 },
                      { f1: "9", f2: "/", score: 168 },
                      { f1: "", f2: "", score: null },
                      { f1: "", f2: "", score: null },
                    ].map((frame, i) => (
                      <div
                        key={i}
                        className={`flex-shrink-0 w-10 text-center ${
                          i < 8 ? "bg-slate-800/80" : "bg-slate-900/50"
                        } rounded`}
                      >
                        <div className="flex border-b border-slate-700">
                          <span className="flex-1 text-[10px] py-0.5 text-white">
                            {frame.f1 === "X" ? (
                              <span className="text-rose-400">X</span>
                            ) : (
                              frame.f1
                            )}
                          </span>
                          <span className="flex-1 text-[10px] py-0.5 border-l border-slate-700 text-white">
                            {frame.f2 === "/" ? (
                              <span className="text-amber-400">/</span>
                            ) : (
                              frame.f2
                            )}
                          </span>
                        </div>
                        <span className="text-[10px] py-1 block text-slate-400">
                          {frame.score || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Series Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Game 1", value: "182" },
                    { label: "Game 2", value: "195" },
                    { label: "Series", value: "545" },
                    { label: "Avg", value: "178" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-2 rounded-lg bg-slate-800/50"
                    >
                      <div className="text-sm font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {stat.label}
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
              { value: "4,500+", label: "Bowlers" },
              { value: "85K+", label: "Games Tracked" },
              { value: "45+", label: "Leagues" },
              { value: "25+", label: "Venues" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-rose-400">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* League Formats */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Every League Format
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Classic leagues, scratch, or baker format. We support every style
              of bowling competition.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leagueFormats.map((format) => (
              <div
                key={format.name}
                className="glass-card rounded-xl p-5 hover:border-rose-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{format.icon}</div>
                <h3 className="font-bold text-white mb-2">{format.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {format.description}
                </p>
                <div className="text-xs text-rose-400">
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
              Built for Bowlers
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything South African bowlers and alleys need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 flex items-center justify-center text-2xl mb-4">
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
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-rose-500/5 to-transparent border-rose-500/20 hover:border-rose-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎳</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">League Bowlers</h4>
                  <p className="text-xs text-rose-400/80">Track your average</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;My average is up 12 pins since I started tracking every
                game.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-pink-500/5 to-transparent border-pink-500/20 hover:border-pink-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Bowling Alleys</h4>
                  <p className="text-xs text-pink-400/80">Run leagues easily</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Handicaps and standings update automatically. Saves hours
                every week.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-fuchsia-500/5 to-transparent border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Social Bowlers</h4>
                  <p className="text-xs text-fuchsia-400/80">Fun with friends</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Love competing with friends and seeing our stats compare.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Spectators</h4>
                  <p className="text-xs text-orange-400/80">Live standings</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Watch league night unfold on the screens. Every strike
                updates instantly.&quot;
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
              Bowling Venues in SA
            </h2>
            <p className="text-slate-400">
              Alleys with active leagues across South Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-rose-500/30 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold">
                  {venue.lanes}
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
              + bowling alleys in all major SA cities
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Roll?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join South Africa&apos;s bowling community. Track your games,
                join leagues, and aim for that perfect game.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
              .filter((s) => s.slug !== "bowling")
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
