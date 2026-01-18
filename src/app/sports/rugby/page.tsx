import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.rugby;

export const metadata: Metadata = {
  title: "Rugby South Africa - Club Leagues, Touch Rugby & Stats Tracking",
  description:
    "South Africa's rugby community platform. Join touch rugby leagues, manage your club, track player stats, and organize tournaments nationwide.",
  alternates: { canonical: "/sports/rugby" },
  keywords: [
    "rugby South Africa",
    "touch rugby SA",
    "rugby leagues Johannesburg",
    "rugby Cape Town",
    "rugby tournaments SA",
    "social rugby SA",
    "sevens rugby SA",
    "club rugby management",
  ],
  openGraph: {
    title: "Rugby South Africa - Club Leagues, Touch Rugby & Stats Tracking",
    description:
      "South Africa's rugby community platform. Join touch rugby leagues and tournaments.",
    url: "https://leaguesports.co.za/sports/rugby",
  },
};

const formats = [
  {
    name: "Touch Rugby",
    description: "Non-contact, fast-paced. Perfect for social sport.",
    icon: "🏉",
    bestFor: "Social leagues, mixed teams",
  },
  {
    name: "Sevens",
    description: "7-a-side, quick games. High intensity.",
    icon: "7️⃣",
    bestFor: "Tournaments, festivals",
  },
  {
    name: "Tag Rugby",
    description: "Beginners friendly. Tags instead of tackles.",
    icon: "🏷️",
    bestFor: "Corporate events, beginners",
  },
  {
    name: "15s",
    description: "Full format club rugby. Traditional game.",
    icon: "🏟️",
    bestFor: "Club leagues, serious competition",
  },
];

const features = [
  {
    icon: "📱",
    title: "Live Scoring",
    description:
      "Real-time match updates with tries, conversions, and penalties. Keep everyone informed.",
  },
  {
    icon: "📊",
    title: "Player Stats",
    description:
      "Track tries, tackles, carries, and appearances. Build your rugby profile.",
  },
  {
    icon: "👥",
    title: "Team Management",
    description:
      "Manage your squad, track availability, and handle team selection for match day.",
  },
  {
    icon: "🏆",
    title: "League Tables",
    description:
      "Automatic standings with points difference, bonus points, and form guides.",
  },
  {
    icon: "📅",
    title: "Fixture Management",
    description:
      "Schedule matches, manage venues, and handle fixture changes with ease.",
  },
  {
    icon: "🎖️",
    title: "Awards & Records",
    description:
      "Top try scorer, player of the match, and season records. Celebrate achievements.",
  },
];

const venues = [
  { name: "The Wanderers", location: "Illovo, JHB", fields: 3 },
  { name: "UCT Sports Grounds", location: "Cape Town", fields: 2 },
  { name: "Kings Park", location: "Durban", fields: 2 },
  { name: "Loftus Versfeld", location: "Pretoria", fields: 2 },
  { name: "False Bay RFC", location: "Cape Town", fields: 2 },
  { name: "RAU Stadium", location: "Auckland Park, JHB", fields: 2 },
];

export default function RugbyPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🏉</span>
                <span className="text-sm text-slate-300">
                  SA Rugby Community 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Rugby in{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                From touch rugby to sevens. Join leagues, manage your team, and
                track every try. The rugby nation deserves rugby tools.
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
                      LIVE TOUCH
                    </span>
                  </div>
                  <span className="text-xs text-green-400 px-2 py-0.5 bg-green-500/10 rounded-full">
                    2nd Half • 34&apos;
                  </span>
                </div>

                {/* Score Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                        <span className="text-lg">🦁</span>
                      </div>
                      <p className="text-sm text-white font-medium">
                        Sandton Lions
                      </p>
                    </div>
                    <div className="px-6 text-center">
                      <p className="text-4xl font-bold">
                        <span className="text-green-400">6</span>
                        <span className="text-slate-600 mx-3">-</span>
                        <span className="text-white">4</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Tries</p>
                    </div>
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                        <span className="text-lg">🦈</span>
                      </div>
                      <p className="text-sm text-white font-medium">
                        Cape Sharks
                      </p>
                    </div>
                  </div>
                </div>

                {/* Try Scorers */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-slate-500">Try Scorers</p>
                  <div className="flex gap-4">
                    <div className="flex-1 text-xs text-slate-400 space-y-1">
                      <p>🏉 J. Smith (2)</p>
                      <p>🏉 M. Patel (2)</p>
                      <p>🏉 K. Williams</p>
                      <p>🏉 D. Naidoo</p>
                    </div>
                    <div className="flex-1 text-xs text-slate-400 space-y-1 text-right">
                      <p>P. Johnson (2) 🏉</p>
                      <p>R. Davies 🏉</p>
                      <p>S. Brown 🏉</p>
                    </div>
                  </div>
                </div>

                {/* Match Info */}
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-xs text-green-400">
                    🏆 Wednesday Night Touch League • Week 8
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
              { value: "12,000+", label: "Players" },
              { value: "8.5K+", label: "Matches Played" },
              { value: "420+", label: "Teams" },
              { value: "65+", label: "Leagues" },
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
              Every Rugby Format
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Touch, sevens, tag, or 15s. We support every format of the game SA
              loves.
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
              Built for Rugby
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything South African rugby teams and leagues need.
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
                  <span className="text-2xl">🏉</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Touch Teams</h4>
                  <p className="text-xs text-green-400/80">Manage your squad</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;No more WhatsApp polls. Everyone checks in through the
                app.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏟️</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Rugby Clubs</h4>
                  <p className="text-xs text-emerald-400/80">Run leagues</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Wednesday touch nights run smoothly now. Players love the
                stats.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Sevens Teams</h4>
                  <p className="text-xs text-teal-400/80">
                    Track tournaments
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Tournament mode is perfect for sevens festivals.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-lime-500/5 to-transparent border-lime-500/20 hover:border-lime-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Rugby Fans</h4>
                  <p className="text-xs text-lime-400/80">Live try updates</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Follow the touch league from the clubhouse. Every try
                updates live.&quot;
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
              Rugby Venues in SA
            </h2>
            <p className="text-slate-400">
              Clubs and grounds across South Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-green-500/30 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                  {venue.fields}
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
              + clubs and grounds across all provinces
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
                Ready to Scrum Down?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join South Africa&apos;s rugby community. Find teams, join
                leagues, and track every try.
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
              .filter((s) => s.slug !== "rugby")
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
