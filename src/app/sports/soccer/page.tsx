import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.soccer;

export const metadata: Metadata = {
  title: "Soccer South Africa - 5-a-side Leagues, Tournaments & Stats",
  description:
    "South Africa's home for amateur soccer. Join 5-a-side leagues, manage your team, track player stats, and compete in tournaments at venues nationwide.",
  alternates: { canonical: "/sports/soccer" },
  keywords: [
    "soccer South Africa",
    "5-a-side soccer SA",
    "football leagues Johannesburg",
    "soccer tournaments SA",
    "futsal South Africa",
    "amateur soccer SA",
    "soccer Cape Town",
    "soccer team management",
  ],
  openGraph: {
    title: "Soccer South Africa - 5-a-side Leagues, Tournaments & Stats",
    description:
      "South Africa's home for amateur soccer. Join 5-a-side leagues and tournaments.",
    url: "https://leaguesports.co.za/sports/soccer",
  },
};

const formats = [
  {
    name: "5-a-side",
    description: "Fast-paced small-sided games. Most popular format.",
    icon: "⚽",
    bestFor: "After-work leagues, social play",
  },
  {
    name: "7-a-side",
    description: "More space, more players. Tactical play.",
    icon: "🏟️",
    bestFor: "Weekend leagues, club tournaments",
  },
  {
    name: "Futsal",
    description: "Indoor soccer with specific rules. Technical game.",
    icon: "🏢",
    bestFor: "Indoor venues, skill development",
  },
  {
    name: "11-a-side",
    description: "Full format amateur soccer.",
    icon: "🥅",
    bestFor: "Club leagues, weekend matches",
  },
];

const features = [
  {
    icon: "📱",
    title: "Live Scoring",
    description:
      "Real-time match updates with goal scorers, assists, and cards. Keep everyone informed.",
  },
  {
    icon: "📊",
    title: "Player Stats",
    description:
      "Track goals, assists, appearances, and more. Build your amateur football profile.",
  },
  {
    icon: "👥",
    title: "Team Management",
    description:
      "Manage your squad, track availability, and organize match-day lineups.",
  },
  {
    icon: "🏆",
    title: "League Tables",
    description:
      "Automatic standings with goal difference, head-to-head, and form guides.",
  },
  {
    icon: "📅",
    title: "Fixture Scheduling",
    description:
      "Automatic fixture generation with venue allocation and rescheduling options.",
  },
  {
    icon: "🎖️",
    title: "Awards & Milestones",
    description:
      "Top scorer, clean sheets, and player of the month. Celebrate achievements.",
  },
];

const venues = [
  { name: "Goals Soccer Centres", location: "Fourways, JHB", pitches: 6 },
  { name: "Supersport 5-a-side", location: "Sandton, JHB", pitches: 4 },
  { name: "Urban Soccer Park", location: "Cape Town", pitches: 5 },
  { name: "The Dome", location: "Northgate, JHB", pitches: 3 },
  { name: "Football Factory", location: "Durban", pitches: 4 },
  { name: "Soccer City Arena", location: "Pretoria", pitches: 4 },
];

export default function SoccerPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">⚽</span>
                <span className="text-sm text-slate-300">
                  SA Amateur Football 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Soccer in{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                Join 5-a-side leagues, manage your team, and track every goal.
                From after-work kickabouts to competitive tournaments,
                we&apos;ve got SA football covered.
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE MATCH
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                    2nd Half • 68&apos;
                  </span>
                </div>

                {/* Score Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                        <span className="text-xl font-bold text-emerald-400">
                          FC
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium">
                        Sandton FC
                      </p>
                    </div>
                    <div className="px-6 text-center">
                      <p className="text-4xl font-bold">
                        <span className="text-emerald-400">3</span>
                        <span className="text-slate-600 mx-3">-</span>
                        <span className="text-white">2</span>
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                        <span className="text-xl font-bold text-blue-400">
                          UT
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium">
                        United Tigers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Goal Scorers */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-slate-500">Goals</p>
                  <div className="flex gap-4">
                    <div className="flex-1 text-xs text-slate-400 space-y-1">
                      <p>
                        ⚽ J. Smith 12&apos;
                      </p>
                      <p>
                        ⚽ M. Patel 34&apos;
                      </p>
                      <p>
                        ⚽ K. Naidoo 58&apos;
                      </p>
                    </div>
                    <div className="flex-1 text-xs text-slate-400 space-y-1 text-right">
                      <p>
                        23&apos; D. Williams ⚽
                      </p>
                      <p>
                        67&apos; R. Johnson ⚽
                      </p>
                    </div>
                  </div>
                </div>

                {/* Match Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Shots", h: "8", a: "6" },
                    { label: "Corners", h: "4", a: "2" },
                    { label: "Fouls", h: "3", a: "5" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-2 rounded-lg bg-slate-800/50"
                    >
                      <div className="text-xs">
                        <span className="text-emerald-400">{stat.h}</span>
                        <span className="text-slate-600 mx-1">-</span>
                        <span className="text-white">{stat.a}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
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
              { value: "25,000+", label: "Players" },
              { value: "18K+", label: "Matches Played" },
              { value: "850+", label: "Teams" },
              { value: "120+", label: "Leagues" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
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
              Every Format
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              5-a-side, 7-a-side, futsal, or full 11. We support every format of
              the beautiful game.
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
              Built for Football
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything South African amateur footballers need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center text-2xl mb-4">
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
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">⚽</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">5-a-side Teams</h4>
                  <p className="text-xs text-emerald-400/80">
                    Manage your squad
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Everyone knows when we&apos;re playing and who&apos;s
                available. No more WhatsApp chaos.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏟️</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Soccer Venues</h4>
                  <p className="text-xs text-teal-400/80">Run leagues easily</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Fixtures, results, tables - all automatic. Players love
                it.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20 hover:border-green-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Stat Trackers</h4>
                  <p className="text-xs text-green-400/80">
                    Track your career
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Finally got proof of my goal tally. The numbers don&apos;t
                lie.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-lime-500/5 to-transparent border-lime-500/20 hover:border-lime-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Football Fans</h4>
                  <p className="text-xs text-lime-400/80">Live match updates</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Follow my mate&apos;s league games live. Get notified
                every time he scores.&quot;
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
              Soccer Venues in SA
            </h2>
            <p className="text-slate-400">
              5-a-side centres and clubs across South Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-emerald-500/30 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                  {venue.pitches}
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
              + venues across all provinces running active leagues
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Kick Off?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join South Africa&apos;s amateur football community. Find
                leagues, track stats, and never miss a game.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
              .filter((s) => s.slug !== "soccer")
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
