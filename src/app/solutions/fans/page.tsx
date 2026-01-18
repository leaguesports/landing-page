import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Fans & Spectators - Live Scores & Match Tracking",
  description:
    "Follow live matches, track your favorite players, and never miss a moment. Real-time scores, live updates, and spectator views for sports across South Africa.",
  keywords: [
    "live sports scores",
    "match tracking",
    "live score updates",
    "sports spectator app",
    "follow live matches",
    "real-time sports scores",
    "South Africa sports",
    "tournament live updates",
  ],
  openGraph: {
    title: "For Fans & Spectators | LeagueSports",
    description:
      "Follow live matches, track your favorite players, and never miss a moment.",
  },
};

const features = [
  {
    icon: "📺",
    title: "Live Match Tracking",
    description:
      "Watch scores update in real-time. Point-by-point, frame-by-frame, ball-by-ball—follow every moment as it happens.",
    highlight: "Real-time updates",
  },
  {
    icon: "🔔",
    title: "Smart Notifications",
    description:
      "Get alerts when matches start, when your favorite player scores, or when there's a dramatic finish. Never miss the action.",
    highlight: "Customizable alerts",
  },
  {
    icon: "⭐",
    title: "Follow Players & Teams",
    description:
      "Add your friends, favorite players, or local teams to your watchlist. Their matches appear in your personalized feed.",
    highlight: "Personalized feed",
  },
  {
    icon: "📊",
    title: "Live Statistics",
    description:
      "See detailed stats as the match unfolds. Averages, win probabilities, head-to-head records—all updated live.",
    highlight: "In-depth analytics",
  },
  {
    icon: "🔗",
    title: "Shareable Links",
    description:
      "Share a link to any match. Friends can follow along without creating an account or downloading an app.",
    highlight: "No signup required",
  },
  {
    icon: "📱",
    title: "Works Everywhere",
    description:
      "Follow from your phone, tablet, or desktop. Optimized for any screen size, any connection speed.",
    highlight: "Any device",
  },
];

const useCases = [
  {
    scenario: "Your partner is playing in a tournament",
    description:
      "Follow their progress match-by-match from work. Get notified when they advance or if there's an upset.",
    icon: "💑",
    example: "Sarah follows her husband's padel americano from the office",
  },
  {
    scenario: "Your kid has a match you can't attend",
    description:
      "Watch the score update in real-time. See quarter-by-quarter results and know the moment the game ends.",
    icon: "👨‍👩‍👧",
    example: "Parents follow their daughter's netball match while traveling",
  },
  {
    scenario: "Your friend claims they're the best",
    description:
      "Check their actual stats. See their real win rate, track record, and how they perform under pressure.",
    icon: "🤝",
    example: "Settle the debate with real data instead of bragging rights",
  },
  {
    scenario: "You're at the venue watching",
    description:
      "See detailed stats on your phone while watching live. Track things the scoreboard doesn't show.",
    icon: "🏟️",
    example: "Enhanced viewing with live stats overlay at the venue",
  },
];

const sports = [
  { name: "Padel", icon: "🎾", example: "Live court scores, set tracking" },
  { name: "Darts", icon: "🎯", example: "180s, averages, checkout suggestions" },
  { name: "Cricket", icon: "🏏", example: "Ball-by-ball, wagon wheel, run rate" },
  { name: "Pool", icon: "🎱", example: "Frame scores, break tracking" },
  { name: "Soccer", icon: "⚽", example: "Goals, cards, possession stats" },
  { name: "Rugby", icon: "🏉", example: "Try scorers, conversions, penalties" },
  { name: "Tennis", icon: "🎾", example: "Point-by-point, serve stats" },
  { name: "Netball", icon: "🏐", example: "Quarter scores, shooter stats" },
];

export default function FansPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">👀</span>
                <span className="text-sm text-slate-300">
                  For Fans & Spectators
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Never Miss a{" "}
                <span className="text-amber-400">Moment</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-4">
                Follow live matches from anywhere. Real-time scores, instant
                updates, and detailed stats—whether you&apos;re at work, traveling,
                or just can&apos;t make it to the venue.
              </p>
              <p className="text-base text-slate-500 mb-8">
                No account required to spectate. Just open a link and watch the
                action unfold in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 py-3 rounded-full text-base"
                >
                  Get Notified at Launch
                </Link>
                <Link
                  href="/product/live"
                  className="btn-secondary px-6 py-3 rounded-full text-base"
                >
                  See Live Mode
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
                      WATCHING LIVE
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-full">
                    Semi-Final
                  </span>
                </div>

                {/* Match Display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                        <span className="text-lg font-bold text-amber-400">
                          JM
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium">
                        Johan M.
                      </p>
                      <p className="text-[10px] text-emerald-400">
                        ⭐ Following
                      </p>
                    </div>
                    <div className="px-6 text-center">
                      <p className="text-3xl font-bold">
                        <span className="text-amber-400">6</span>
                        <span className="text-slate-600 mx-2">-</span>
                        <span className="text-white">4</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Set 2</p>
                    </div>
                    <div className="text-center flex-1">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-700 flex items-center justify-center mb-2">
                        <span className="text-lg font-bold text-slate-400">
                          SP
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        Sarah P.
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Opponent
                      </p>
                    </div>
                  </div>
                  <div className="text-center text-xs text-slate-400">
                    Game: 40-30 • Johan serving
                  </div>
                </div>

                {/* Live Updates Feed */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-2">Live Updates</p>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-amber-400 text-xs">🎾</span>
                    <span className="text-xs text-amber-400">
                      Johan breaks serve! Now leads 5-4
                    </span>
                    <span className="text-[10px] text-slate-500 ml-auto">
                      2m ago
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                    <span className="text-slate-400 text-xs">📊</span>
                    <span className="text-xs text-slate-400">
                      Johan&apos;s win probability: 78%
                    </span>
                    <span className="text-[10px] text-slate-500 ml-auto">
                      5m ago
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                    <span className="text-slate-400 text-xs">🏆</span>
                    <span className="text-xs text-slate-400">
                      Winner faces Marco in the final
                    </span>
                    <span className="text-[10px] text-slate-500 ml-auto">
                      8m ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Perfect For <span className="gradient-text">Every Fan</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Whether you&apos;re following family, friends, or your local
              community—stay connected to the matches that matter.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((useCase) => (
              <div
                key={useCase.scenario}
                className="glass-card rounded-xl p-6 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl shrink-0">
                    {useCase.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">
                      {useCase.scenario}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">
                      {useCase.description}
                    </p>
                    <p className="text-xs text-amber-400/80 italic">
                      {useCase.example}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Everything You Need to Follow
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Powerful spectator tools that keep you connected to the action.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-6 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{feature.icon}</div>
                  <span className="text-[10px] text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-full">
                    {feature.highlight}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Grid */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Follow Any Sport
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Sport-specific live tracking with relevant stats for each game.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sports.map((sport) => (
              <Link
                key={sport.name}
                href={`/sports/${sport.name.toLowerCase()}`}
                className="glass-card rounded-xl p-4 hover:border-amber-500/30 transition-colors text-center group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {sport.icon}
                </div>
                <h3 className="font-bold text-white text-sm mb-1">
                  {sport.name}
                </h3>
                <p className="text-[10px] text-slate-500">{sport.example}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Start Following in <span className="text-amber-400">Seconds</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                🔗
              </div>
              <h3 className="font-bold text-white mb-2">1. Get a Link</h3>
              <p className="text-sm text-slate-400">
                Your friend shares a match link, or you find it in the app.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                📱
              </div>
              <h3 className="font-bold text-white mb-2">2. Open & Watch</h3>
              <p className="text-sm text-slate-400">
                No signup needed. Just open and start following live.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                🔔
              </div>
              <h3 className="font-bold text-white mb-2">3. Stay Updated</h3>
              <p className="text-sm text-slate-400">
                Optional: Enable notifications to never miss key moments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Follow the Action?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join the waitlist to be first to know when LeagueSports
                launches. Follow matches, support your favorites, and never miss
                a moment.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-8 py-4 rounded-full text-base"
                >
                  Join the Waitlist
                </Link>
                <Link
                  href="/product/live"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Learn about Live Mode →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
