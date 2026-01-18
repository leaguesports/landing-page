import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.darts;

export const metadata: Metadata = {
  title: "Darts South Africa - Pub Leagues, Tournaments & Live Scoring",
  description:
    "South Africa's home for darts. Join pub leagues, track your averages, and compete in tournaments. From 501 to cricket, we've got you covered.",
  alternates: { canonical: "/sports/darts" },
  keywords: [
    "darts South Africa",
    "darts leagues SA",
    "pub darts Johannesburg",
    "darts tournaments",
    "501 scoring app",
    "darts Cape Town",
    "darts averages",
    "dart league management",
    "180s tracker",
    "checkout calculator",
  ],
  openGraph: {
    title: "Darts South Africa - Pub Leagues, Tournaments & Live Scoring",
    description:
      "South Africa's home for darts. Join pub leagues, track your averages, and compete in tournaments.",
    url: "https://leaguesports.co.za/sports/darts",
  },
};

const gameFormats = [
  {
    name: "501",
    description: "Classic format. Start at 501, finish on a double.",
    icon: "🎯",
    bestFor: "League matches, tournaments",
  },
  {
    name: "301",
    description: "Quick games. Double in, double out.",
    icon: "⚡",
    bestFor: "Warm-ups, quick matches",
  },
  {
    name: "Cricket",
    description: "Strategic gameplay. Close numbers 15-20 and bullseye.",
    icon: "🏏",
    bestFor: "Social play, mixed skills",
  },
  {
    name: "Around the Clock",
    description: "Hit 1-20 in order. Great for practice.",
    icon: "🔄",
    bestFor: "Training, beginners",
  },
];

const features = [
  {
    icon: "📱",
    title: "Live 501 Scoring",
    description:
      "Real-time scoring with voice input option. Large buttons for quick entry, instant calculation.",
  },
  {
    icon: "📊",
    title: "Average Tracking",
    description:
      "Track your 3-dart average across all games. See trends and improvement over time.",
  },
  {
    icon: "🎯",
    title: "180s & High Scores",
    description:
      "Every 180, ton-80, and high checkout recorded. Build your highlight reel.",
  },
  {
    icon: "🧮",
    title: "Checkout Suggestions",
    description:
      "Get optimal checkout routes for any score. Learn the best finishes as you play.",
  },
  {
    icon: "📺",
    title: "Pub Display Mode",
    description:
      "Cast live scores to the bar TV. Professional scoreboard for spectators.",
  },
  {
    icon: "🏆",
    title: "League Management",
    description:
      "Run your pub league with automatic fixtures, standings, and stats.",
  },
];

const venues = [
  { name: "The Baron", location: "Sandton, JHB", boards: 4 },
  { name: "Hooters Rivonia", location: "Rivonia, JHB", boards: 3 },
  { name: "Slug & Lettuce", location: "V&A, Cape Town", boards: 2 },
  { name: "Jolly Roger", location: "Durban", boards: 3 },
  { name: "The Brazen Head", location: "Pretoria", boards: 4 },
  { name: "Tin Roof", location: "Cape Town", boards: 2 },
];

export default function DartsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🎯</span>
                <span className="text-sm text-slate-300">
                  SA&apos;s Pub Darts Community 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Darts in{" "}
                <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                From casual pub games to competitive leagues. Track your
                averages, join leagues, and compete at venues across the
                country. Game on.
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

            {/* Live Scoring Preview */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE 501
                    </span>
                  </div>
                  <span className="text-xs text-sky-400 px-2 py-0.5 bg-sky-500/10 rounded-full">
                    Leg 3 of 5
                  </span>
                </div>

                {/* Score Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500 mb-1">Player 1</p>
                      <p className="text-4xl font-bold text-sky-400 font-mono">
                        167
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Avg: 82.4</p>
                    </div>
                    <div className="px-6">
                      <div className="text-sm text-slate-500">Legs</div>
                      <div className="text-xl font-bold">
                        <span className="text-sky-400">2</span>
                        <span className="text-slate-600 mx-2">-</span>
                        <span className="text-emerald-400">1</span>
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500 mb-1">Player 2</p>
                      <p className="text-4xl font-bold text-emerald-400 font-mono">
                        224
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Avg: 76.8</p>
                    </div>
                  </div>
                </div>

                {/* Last 3 Darts */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Last Visit</p>
                  <div className="flex gap-2">
                    <div className="flex-1 text-center py-2 rounded-lg bg-sky-500/20 border border-sky-500/30">
                      <span className="text-lg font-bold text-sky-400">T20</span>
                    </div>
                    <div className="flex-1 text-center py-2 rounded-lg bg-sky-500/20 border border-sky-500/30">
                      <span className="text-lg font-bold text-sky-400">T20</span>
                    </div>
                    <div className="flex-1 text-center py-2 rounded-lg bg-sky-500/20 border border-sky-500/30">
                      <span className="text-lg font-bold text-sky-400">T20</span>
                    </div>
                    <div className="flex items-center justify-center px-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                      <span className="text-sm font-bold text-amber-400">
                        180!
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Suggestion */}
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">💡</span>
                    <span className="text-sm text-emerald-400">
                      Checkout: T20 → T19 → D25
                    </span>
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
              { value: "6,200+", label: "Players" },
              { value: "180K+", label: "Legs Played" },
              { value: "8,500+", label: "180s Hit" },
              { value: "85+", label: "Pub Leagues" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-sky-400">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Formats */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              All Your Favorite Formats
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From classic 501 to cricket, we support every game format. Perfect
              scoring every time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gameFormats.map((format) => (
              <div
                key={format.name}
                className="glass-card rounded-xl p-5 hover:border-sky-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{format.icon}</div>
                <h3 className="font-bold text-white mb-2">{format.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {format.description}
                </p>
                <div className="text-xs text-sky-400">
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
              Built for Darts
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every feature designed with dart players in mind. From the oche to
              the leaderboard.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center text-2xl mb-4">
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
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-sky-500/5 to-transparent border-sky-500/20 hover:border-sky-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <span className="text-2xl">🍺</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Pub Owners</h4>
                  <p className="text-xs text-sky-400/80">Run weekly leagues</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Tuesday nights run themselves now. Players love seeing
                their stats on the TV.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">League Players</h4>
                  <p className="text-xs text-blue-400/80">Track your average</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;My average has gone up 8 points since I started
                tracking.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Social Players</h4>
                  <p className="text-xs text-indigo-400/80">Fun with friends</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;No more arguments about the score. Everyone can see
                it.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-cyan-500/5 to-transparent border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Spectators</h4>
                  <p className="text-xs text-cyan-400/80">Watch the action</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Follow league night from home. See every 180 as it
                happens.&quot;
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
              Popular Darts Venues in SA
            </h2>
            <p className="text-slate-400">
              Join leagues at pubs and clubs across South Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-sky-500/30 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {venue.boards}
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
              + 80+ more venues with active leagues across SA
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Raise Your Average?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join South Africa&apos;s darts community. Track your stats,
                compete in leagues, and watch those 180s pile up.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
              .filter((s) => s.slug !== "darts")
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
