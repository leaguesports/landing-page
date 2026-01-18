import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.netball;

export const metadata: Metadata = {
  title: "Netball South Africa - Leagues, Tournaments & Stats Tracking",
  description:
    "South Africa's netball community platform. Join leagues, manage your team, track player stats, and organize tournaments at venues nationwide.",
  alternates: { canonical: "/sports/netball" },
  keywords: [
    "netball South Africa",
    "netball leagues SA",
    "netball Johannesburg",
    "netball Cape Town",
    "netball tournaments SA",
    "social netball SA",
    "netball team management",
    "netball stats tracking",
  ],
  openGraph: {
    title: "Netball South Africa - Leagues, Tournaments & Stats Tracking",
    description:
      "South Africa's netball community platform. Join leagues and tournaments.",
    url: "https://leaguesports.co.za/sports/netball",
  },
};

const formats = [
  {
    name: "7-a-side",
    description: "Traditional netball with all positions.",
    icon: "🏐",
    bestFor: "Club leagues, competitions",
  },
  {
    name: "5-a-side",
    description: "Fast-paced modified format. Smaller teams.",
    icon: "⚡",
    bestFor: "Social leagues, corporate",
  },
  {
    name: "Mixed Netball",
    description: "Co-ed teams with position rules.",
    icon: "👥",
    bestFor: "Social events, mixed groups",
  },
  {
    name: "Walking Netball",
    description: "Slower pace, all ages welcome.",
    icon: "🚶",
    bestFor: "Inclusive play, returning players",
  },
];

const features = [
  {
    icon: "📱",
    title: "Live Scoring",
    description:
      "Quarter-by-quarter scoring with goal tracking. Real-time updates for spectators.",
  },
  {
    icon: "📊",
    title: "Player Stats",
    description:
      "Track goals, assists, interceptions, and appearances by position.",
  },
  {
    icon: "👥",
    title: "Team Management",
    description:
      "Manage your squad, track availability, and handle position assignments.",
  },
  {
    icon: "🏆",
    title: "League Tables",
    description:
      "Automatic standings with goal difference, head-to-head, and form.",
  },
  {
    icon: "📅",
    title: "Fixture Scheduling",
    description:
      "Generate fixtures, manage venues, and handle umpire assignments.",
  },
  {
    icon: "🎖️",
    title: "Awards & Records",
    description:
      "Top scorer, player of the match, and season records. Celebrate achievements.",
  },
];

const venues = [
  { name: "Ellis Park Netball", location: "Johannesburg", courts: 8 },
  { name: "Bellville Netball", location: "Cape Town", courts: 6 },
  { name: "Hoy Park", location: "Durban", courts: 6 },
  { name: "LC de Villiers", location: "Pretoria", courts: 8 },
  { name: "Tygerberg Netball", location: "Cape Town", courts: 4 },
  { name: "Wanderers Sports Club", location: "Johannesburg", courts: 4 },
];

export default function NetballPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🏐</span>
                <span className="text-sm text-slate-300">
                  SA Netball Community 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Netball in{" "}
                <span className="bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                Join leagues, manage your team, and track every goal. From
                social netball to competitive play, connect with SA&apos;s
                netball community.
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE MATCH
                    </span>
                  </div>
                  <span className="text-xs text-pink-400 px-2 py-0.5 bg-pink-500/10 rounded-full">
                    Q3 • 8:42
                  </span>
                </div>

                {/* Score Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto rounded-full bg-pink-500/20 flex items-center justify-center mb-2">
                        <span className="text-lg font-bold text-pink-400">
                          SA
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium">
                        Sandton Stars
                      </p>
                    </div>
                    <div className="px-6 text-center">
                      <p className="text-4xl font-bold">
                        <span className="text-pink-400">34</span>
                        <span className="text-slate-600 mx-3">-</span>
                        <span className="text-white">29</span>
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                        <span className="text-lg font-bold text-purple-400">
                          CP
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium">
                        Cape Phoenix
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quarter Scores */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Quarter Scores</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { q: "Q1", h: "12", a: "10" },
                      { q: "Q2", h: "11", a: "9" },
                      { q: "Q3", h: "11", a: "10" },
                      { q: "Q4", h: "-", a: "-" },
                    ].map((quarter) => (
                      <div
                        key={quarter.q}
                        className="text-center p-2 rounded-lg bg-slate-800/50"
                      >
                        <div className="text-[10px] text-slate-500 mb-1">
                          {quarter.q}
                        </div>
                        <div className="text-xs">
                          <span className="text-pink-400">{quarter.h}</span>
                          <span className="text-slate-600 mx-1">-</span>
                          <span className="text-white">{quarter.a}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Scorers */}
                <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  <div className="flex justify-between items-center text-xs">
                    <div className="text-pink-400">
                      <span className="font-medium">Top: </span>
                      J. Smith (GS) - 18 goals
                    </div>
                    <div className="text-slate-400">
                      M. Patel (GS) - 14 goals
                    </div>
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
              { value: "22,000+", label: "Players" },
              { value: "15K+", label: "Matches Played" },
              { value: "680+", label: "Teams" },
              { value: "95+", label: "Leagues" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-pink-400">
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
              Every Netball Format
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              7-a-side, 5-a-side, mixed, or walking netball. We support every
              format.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {formats.map((format) => (
              <div
                key={format.name}
                className="glass-card rounded-xl p-5 hover:border-pink-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{format.icon}</div>
                <h3 className="font-bold text-white mb-2">{format.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {format.description}
                </p>
                <div className="text-xs text-pink-400">
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
              Built for Netball
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything South African netball teams and leagues need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 flex items-center justify-center text-2xl mb-4">
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
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-pink-500/5 to-transparent border-pink-500/20 hover:border-pink-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏐</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Club Teams</h4>
                  <p className="text-xs text-pink-400/80">Manage your squad</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Team selection and availability sorted before every
                game.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-rose-500/5 to-transparent border-rose-500/20 hover:border-rose-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Netball Clubs</h4>
                  <p className="text-xs text-rose-400/80">Run leagues</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Fixtures, results, and tables all in one place. Parents
                love it too.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-fuchsia-500/5 to-transparent border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Social Leagues</h4>
                  <p className="text-xs text-fuchsia-400/80">Fun competition</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Mixed netball Wednesdays are so well organized now.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Netball Fans</h4>
                  <p className="text-xs text-purple-400/80">Live scores</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Follow my daughter&apos;s games from work. Quarter-by-quarter
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
              Netball Venues in SA
            </h2>
            <p className="text-slate-400">
              Courts and clubs across South Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-pink-500/30 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold">
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
              + netball courts and clubs across all provinces
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Take the Court?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join South Africa&apos;s netball community. Find teams, join
                leagues, and track every goal.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
              .filter((s) => s.slug !== "netball")
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
