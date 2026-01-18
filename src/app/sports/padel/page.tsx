import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.padel;

export const metadata: Metadata = {
  title: "Padel South Africa - Tournaments, Leagues & Live Scoring",
  description:
    "South Africa's fastest-growing racket sport. Join padel leagues in Johannesburg, Cape Town, Durban and beyond. Track your stats, find partners, and compete in tournaments.",
  alternates: { canonical: "/sports/padel" },
  keywords: [
    "padel South Africa",
    "padel Johannesburg",
    "padel Cape Town",
    "padel tournaments SA",
    "padel leagues",
    "padel courts South Africa",
    "Sandton padel",
    "padel rankings SA",
    "americano padel",
    "mexicano tournament",
  ],
  openGraph: {
    title: "Padel South Africa - Tournaments, Leagues & Live Scoring",
    description:
      "South Africa's fastest-growing racket sport. Join padel leagues, track stats, and compete in tournaments.",
    url: "https://leaguesports.co.za/sports/padel",
  },
};

const tournamentFormats = [
  {
    name: "Americano",
    description: "Rotating partners each round. Everyone plays with everyone.",
    icon: "🔄",
    bestFor: "Social events, club nights",
  },
  {
    name: "Mexicano",
    description: "Dynamic pairing based on current standings. Always competitive.",
    icon: "🎲",
    bestFor: "Mixed skill levels",
  },
  {
    name: "Team Knockout",
    description: "Fixed doubles teams compete in elimination brackets.",
    icon: "🏆",
    bestFor: "Competitive tournaments",
  },
  {
    name: "Round Robin",
    description: "Every team plays every team. Most points wins.",
    icon: "🔁",
    bestFor: "League play, group stages",
  },
];

const features = [
  {
    icon: "📱",
    title: "Live Court Scoring",
    description:
      "Score matches from your phone. Games, sets, and tiebreaks update in real-time for all viewers.",
  },
  {
    icon: "👥",
    title: "Partner Finder",
    description:
      "Find players at your level in your area. Filter by skill, availability, and preferred courts.",
  },
  {
    icon: "📊",
    title: "Performance Stats",
    description:
      "Track win rate, favorite partners, court preferences, and performance trends over time.",
  },
  {
    icon: "🎯",
    title: "Skill Ratings",
    description:
      "ELO-based rating system that accurately reflects your padel skill across all matches.",
  },
  {
    icon: "📺",
    title: "Venue Displays",
    description:
      "Cast live brackets and scores to TVs at your club. Professional tournament atmosphere.",
  },
  {
    icon: "🔔",
    title: "Smart Notifications",
    description:
      "Get alerts when it's your turn to play. Never miss a match or hold up the tournament.",
  },
];

const venues = [
  { name: "The Padel Club", location: "Sandton, JHB", courts: 8 },
  { name: "Padel World", location: "Fourways, JHB", courts: 6 },
  { name: "V&A Padel", location: "Waterfront, CT", courts: 4 },
  { name: "Padel Pro", location: "Umhlanga, DBN", courts: 6 },
  { name: "Pretoria Padel Club", location: "Menlyn, PTA", courts: 4 },
  { name: "Stellenbosch Padel", location: "Stellenbosch", courts: 4 },
];

export default function PadelPage() {
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
                  South Africa&apos;s Fastest Growing Sport 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Padel in{" "}
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                Join the padel revolution. Run americano tournaments, find
                partners, track your stats, and compete at clubs across Gauteng,
                Western Cape, and KZN.
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

            {/* Live Match Preview Card */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE MATCH
                    </span>
                  </div>
                  <span className="text-xs text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-full">
                    Court 3
                  </span>
                </div>

                {/* Score Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500 mb-1">Team A</p>
                      <p className="text-sm text-white font-medium">
                        Marco & Sarah
                      </p>
                    </div>
                    <div className="px-4">
                      <div className="text-2xl font-bold">
                        <span className="text-amber-400">6</span>
                        <span className="text-slate-600 mx-2">-</span>
                        <span className="text-white">4</span>
                      </div>
                      <p className="text-[10px] text-slate-500 text-center">
                        Set 1
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500 mb-1">Team B</p>
                      <p className="text-sm text-white font-medium">
                        Johan & Lisa
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 text-xs text-slate-500">
                    <span>Game: 30-40</span>
                    <span>•</span>
                    <span>Duration: 42 min</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Winners", a: "12", b: "8" },
                    { label: "Errors", a: "6", b: "9" },
                    { label: "Aces", a: "3", b: "1" },
                    { label: "Breaks", a: "2", b: "1" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-2 rounded-lg bg-slate-800/50"
                    >
                      <div className="text-[10px] text-slate-500 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs">
                        <span className="text-amber-400">{stat.a}</span>
                        <span className="text-slate-600 mx-1">-</span>
                        <span className="text-white">{stat.b}</span>
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
              { value: "8,500+", label: "Active Players" },
              { value: "120+", label: "Courts Listed" },
              { value: "45K+", label: "Matches Tracked" },
              { value: "350+", label: "Tournaments Run" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournament Formats */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Every Tournament Format
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Run the perfect event for your club. From social americanos to
              competitive knockouts, we handle the brackets and scoring.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tournamentFormats.map((format) => (
              <div
                key={format.name}
                className="glass-card rounded-xl p-5 hover:border-amber-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{format.icon}</div>
                <h3 className="font-bold text-white mb-2">{format.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {format.description}
                </p>
                <div className="text-xs text-amber-400">
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
              Everything You Need for Padel
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Professional tools designed for South African padel players,
              clubs, and communities.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
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
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Padel Clubs</h4>
                  <p className="text-xs text-amber-400/80">
                    Run weekly americanos
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Our Tuesday night americano runs itself now. Players love
                the live scoring.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎾</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Social Players</h4>
                  <p className="text-xs text-orange-400/80">Find your level</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Finally found regular hitting partners at my skill
                level.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20 hover:border-red-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Competitive Players</h4>
                  <p className="text-xs text-red-400/80">Track your ranking</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;The rating system is fair. I can see exactly where I stand
                in SA.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-yellow-500/5 to-transparent border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Fans & Spectators</h4>
                  <p className="text-xs text-yellow-400/80">Follow live matches</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;I follow my partner&apos;s tournament from work. Live
                scores update instantly.&quot;
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
              Popular Padel Venues in SA
            </h2>
            <p className="text-slate-400">
              Connect with padel communities across South Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-amber-500/30 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
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
              + dozens more venues joining monthly across all 9 provinces
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Elevate Your Padel Game?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of South African padel players already using
                LeagueSports. Find partners, compete in tournaments, and watch
                your rating climb.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
              .filter((s) => s.slug !== "padel")
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
