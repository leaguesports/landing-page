import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.cricket;

export const metadata: Metadata = {
  title: "Cricket South Africa - Leagues, Scoring & Stats Tracking",
  description:
    "South Africa's cricket management platform. Run leagues, track batting and bowling stats, and manage your cricket club digitally.",
  alternates: { canonical: "/sports/cricket" },
  keywords: [
    "cricket South Africa",
    "cricket leagues SA",
    "cricket scoring app",
    "cricket stats tracking",
    "club cricket management",
    "T20 tournaments SA",
    "cricket Johannesburg",
    "cricket Cape Town",
  ],
  openGraph: {
    title: "Cricket South Africa - Leagues, Scoring & Stats Tracking",
    description:
      "South Africa's cricket management platform. Run leagues and track your stats.",
    url: "https://leaguesports.co.za/sports/cricket",
  },
};

const formats = [
  {
    name: "T20",
    description: "Fast-paced 20-over cricket. Perfect for evening leagues.",
    icon: "⚡",
    bestFor: "Quick matches, floodlit games",
  },
  {
    name: "One Day",
    description: "50-over matches for weekend cricket.",
    icon: "☀️",
    bestFor: "Club cricket, weekend leagues",
  },
  {
    name: "Indoor",
    description: "8-a-side indoor cricket. All year round.",
    icon: "🏢",
    bestFor: "Winter cricket, corporate events",
  },
  {
    name: "Pairs Cricket",
    description: "Fast format perfect for social cricket.",
    icon: "👥",
    bestFor: "Social events, quick games",
  },
];

const features = [
  {
    icon: "📱",
    title: "Live Scoring",
    description:
      "Ball-by-ball scoring with wagon wheel, manhattan, and worm charts. Real-time updates for everyone.",
  },
  {
    icon: "📊",
    title: "Career Stats",
    description:
      "Track batting average, strike rate, bowling economy, and more across all your matches.",
  },
  {
    icon: "🏆",
    title: "League Tables",
    description:
      "Automatic standings with net run rate, head-to-head records, and qualification scenarios.",
  },
  {
    icon: "👥",
    title: "Team Management",
    description:
      "Manage your squad, track availability, and handle team selection for match day.",
  },
  {
    icon: "🎖️",
    title: "Milestones",
    description:
      "Celebrate centuries, five-fors, and career milestones. Automatic notifications.",
  },
  {
    icon: "📺",
    title: "Scoreboard Display",
    description:
      "Cast live scores to screens at your ground. Professional match day experience.",
  },
];

const venues = [
  { name: "Wanderers Club", location: "Illovo, JHB", type: "Club" },
  { name: "Green Point CC", location: "Cape Town", type: "Club" },
  { name: "Kingsmead", location: "Durban", type: "Club" },
  { name: "Indoor Cricket Centre", location: "Sandton, JHB", type: "Indoor" },
  { name: "SuperSport Park CC", location: "Centurion, PTA", type: "Club" },
  { name: "Newlands CC", location: "Cape Town", type: "Club" },
];

export default function CricketPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🏏</span>
                <span className="text-sm text-slate-300">
                  SA Club Cricket Community 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Cricket in{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                From club cricket to T20 leagues. Live scoring, career stats,
                and team management for South African cricket communities.
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE T20
                    </span>
                  </div>
                  <span className="text-xs text-green-400 px-2 py-0.5 bg-green-500/10 rounded-full">
                    15.3 Overs
                  </span>
                </div>

                {/* Score Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Wanderers CC
                      </p>
                      <p className="text-3xl font-bold text-green-400">
                        156/4
                      </p>
                      <p className="text-xs text-slate-400">
                        RR: 10.06 • CRR: 11.2
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">vs</p>
                      <p className="text-sm text-slate-400">Green Point CC</p>
                      <p className="text-xs text-slate-500">Target: 178</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700 pt-3">
                    <span>Need 22 from 27 balls</span>
                    <span className="text-green-400">Required RR: 4.89</span>
                  </div>
                </div>

                {/* Current Batsmen */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-slate-500">At the crease</p>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <span className="text-sm text-white">J. Smith *</span>
                    <span className="text-sm font-bold text-green-400">
                      67 (42)
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/50">
                    <span className="text-sm text-white">M. Patel</span>
                    <span className="text-sm text-slate-400">23 (18)</span>
                  </div>
                </div>

                {/* Last Over */}
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-xs text-slate-500 mb-2">This Over</p>
                  <div className="flex gap-2">
                    {["1", "4", "W", "2", "6", "•"].map((ball, i) => (
                      <span
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          ball === "4" || ball === "6"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : ball === "W"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : ball === "•"
                            ? "bg-slate-700 text-slate-500"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {ball}
                      </span>
                    ))}
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
              { value: "15,000+", label: "Players" },
              { value: "8,500+", label: "Matches Scored" },
              { value: "280+", label: "Clubs" },
              { value: "45+", label: "Leagues" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-400">
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
              All Cricket Formats
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From T20 blasts to traditional fixtures. Track every ball, every
              match.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {formats.map((format) => (
              <div
                key={format.name}
                className="glass-card rounded-xl p-5 hover:border-green-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{format.icon}</div>
                <h3 className="font-bold text-white mb-2">{format.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {format.description}
                </p>
                <div className="text-xs text-green-400">
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
              Built for Cricket
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything South African cricket clubs and leagues need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center text-2xl mb-4">
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
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20 hover:border-green-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏏</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Club Cricketers</h4>
                  <p className="text-xs text-green-400/80">Track your career</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;All my stats in one place. Can finally prove my average to
                the lads.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Cricket Clubs</h4>
                  <p className="text-xs text-emerald-400/80">Manage teams</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Team selection, availability, stats - all sorted on match
                day.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">League Admins</h4>
                  <p className="text-xs text-teal-400/80">Run competitions</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Net run rate, results, standings - all calculated
                automatically.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-lime-500/5 to-transparent border-lime-500/20 hover:border-lime-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Cricket Fans</h4>
                  <p className="text-xs text-lime-400/80">Ball-by-ball updates</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Follow matches ball-by-ball from anywhere. Better than
                radio commentary.&quot;
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
              Cricket Venues in SA
            </h2>
            <p className="text-slate-400">
              Clubs and venues across South Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-green-500/30 transition-colors flex items-center gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                    venue.type === "Indoor"
                      ? "bg-gradient-to-br from-sky-500 to-blue-600"
                      : "bg-gradient-to-br from-green-500 to-emerald-600"
                  }`}
                >
                  {venue.type === "Indoor" ? "🏢" : "🏏"}
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
              + 280 clubs across all provinces
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Manage Your Cricket?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of South African cricketers. Track your stats,
                manage your team, and be part of the digital cricket revolution.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
              .filter((s) => s.slug !== "cricket")
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
