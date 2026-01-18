import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.pool;

export const metadata: Metadata = {
  title: "Pool South Africa - Pub Leagues, 8-Ball & 9-Ball Tournaments",
  description:
    "South Africa's pool community. Join pub leagues, compete in tournaments, and track your stats across 8-ball and 9-ball.",
  alternates: { canonical: "/sports/pool" },
  keywords: [
    "pool South Africa",
    "8-ball leagues SA",
    "9-ball tournaments",
    "pub pool leagues",
    "pool Johannesburg",
    "pool Cape Town",
    "cue sports SA",
    "billiards South Africa",
  ],
  openGraph: {
    title: "Pool South Africa - Pub Leagues, 8-Ball & 9-Ball Tournaments",
    description:
      "South Africa's pool community. Join pub leagues and compete in tournaments.",
    url: "https://leaguesports.co.za/sports/pool",
  },
};

const gameFormats = [
  {
    name: "8-Ball",
    description: "Classic stripes vs solids. Pot the 8-ball to win.",
    icon: "🎱",
    bestFor: "Pub leagues, social play",
  },
  {
    name: "9-Ball",
    description: "Rotation game. Pot in order, 9-ball wins.",
    icon: "9️⃣",
    bestFor: "Competitive play, tournaments",
  },
  {
    name: "Blackball",
    description: "World rules 8-ball. Two shots on fouls.",
    icon: "⚫",
    bestFor: "International rules, leagues",
  },
  {
    name: "Scotch Doubles",
    description: "Teams alternate shots. Great for social events.",
    icon: "👥",
    bestFor: "Team events, social nights",
  },
];

const features = [
  {
    icon: "📱",
    title: "Match Scoring",
    description:
      "Track frames, safeties, and fouls. Race formats with automatic scoring.",
  },
  {
    icon: "📊",
    title: "Player Stats",
    description:
      "Win rate, frame count, break and runs, and performance against specific opponents.",
  },
  {
    icon: "🏆",
    title: "League Management",
    description:
      "Run weekly leagues with automatic fixtures, standings, and playoff brackets.",
  },
  {
    icon: "📺",
    title: "Bar Display Mode",
    description:
      "Show live scores on the pub TV. Professional atmosphere for your league.",
  },
  {
    icon: "🎯",
    title: "Handicap System",
    description:
      "Fair competition with skill-based handicaps. Better players give head starts.",
  },
  {
    icon: "🔔",
    title: "Table Notifications",
    description:
      "Get alerts when your table is ready or when it's time for your match.",
  },
];

const venues = [
  { name: "Rockey's Sports Bar", location: "Fourways, JHB", tables: 6 },
  { name: "The Baron", location: "Sandton, JHB", tables: 4 },
  { name: "Cool Runnings", location: "Hatfield, PTA", tables: 8 },
  { name: "Tiger Tiger", location: "Cape Town", tables: 5 },
  { name: "The Local Grill", location: "Umhlanga, DBN", tables: 4 },
  { name: "News Cafe", location: "Sandton, JHB", tables: 3 },
];

export default function PoolPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🎱</span>
                <span className="text-sm text-slate-300">
                  SA Pool Community 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Pool in{" "}
                <span className="bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                Join pub leagues, compete in tournaments, and track your stats.
                From casual 8-ball to competitive 9-ball, we&apos;ve got your
                cue sports covered.
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

            {/* Match Preview Card */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE MATCH
                    </span>
                  </div>
                  <span className="text-xs text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded-full">
                    Race to 5
                  </span>
                </div>

                {/* Score Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500 mb-1">Player 1</p>
                      <p className="text-sm text-white font-medium mb-2">
                        James M.
                      </p>
                      <p className="text-4xl font-bold text-purple-400">3</p>
                    </div>
                    <div className="px-4">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-2xl">🎱</span>
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500 mb-1">Player 2</p>
                      <p className="text-sm text-white font-medium mb-2">
                        Sarah K.
                      </p>
                      <p className="text-4xl font-bold text-white">2</p>
                    </div>
                  </div>
                </div>

                {/* Frame History */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Frames</p>
                  <div className="flex justify-center gap-2">
                    {["W", "L", "W", "L", "W"].map((result, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          result === "W"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Frame */}
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Current Frame</span>
                    <span className="text-purple-400">James at table</span>
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
              { value: "5,200+", label: "Players" },
              { value: "48K+", label: "Frames Played" },
              { value: "95+", label: "Pub Leagues" },
              { value: "180+", label: "Venues" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-400">
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
              All Pool Formats
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              8-ball, 9-ball, blackball, or scotch doubles. We support every
              game format.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gameFormats.map((format) => (
              <div
                key={format.name}
                className="glass-card rounded-xl p-5 hover:border-purple-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{format.icon}</div>
                <h3 className="font-bold text-white mb-2">{format.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {format.description}
                </p>
                <div className="text-xs text-purple-400">
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
              Built for Pool Players
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need for pub leagues and tournament play.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 flex items-center justify-center text-2xl mb-4">
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
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">🍺</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Pub Owners</h4>
                  <p className="text-xs text-purple-400/80">Run weekly leagues</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;League nights bring in regulars every week. They love the
                live scoreboard.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-violet-500/5 to-transparent border-violet-500/20 hover:border-violet-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎱</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">League Players</h4>
                  <p className="text-xs text-violet-400/80">Track your game</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Can see my win rate against every opponent. Great for
                strategy.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Tournament Players</h4>
                  <p className="text-xs text-indigo-400/80">Compete seriously</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;The handicap system is fair. Makes competition exciting.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-fuchsia-500/5 to-transparent border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Spectators</h4>
                  <p className="text-xs text-fuchsia-400/80">Watch the action</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Follow league night from the bar. Live frames on the big
                screen.&quot;
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
              Popular Pool Venues in SA
            </h2>
            <p className="text-slate-400">
              Pubs and clubs with active pool leagues
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-purple-500/30 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold">
                  {venue.tables}
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
              + 180 venues with pool tables across SA
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Rack Up?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join South Africa&apos;s pool community. Find leagues, track
                your stats, and prove you&apos;re the best on the baize.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
              .filter((s) => s.slug !== "pool")
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
