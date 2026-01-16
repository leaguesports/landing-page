import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats & Progression - Track Performance & Earn Badges",
  description:
    "Track every stat, earn achievement badges, and watch your skill rating climb. ELO-based rankings, detailed analytics, and leaderboards for competitive players.",
  keywords: [
    "sports statistics tracking",
    "skill rating system",
    "ELO ranking sports",
    "achievement badges",
    "sports leaderboard",
    "performance analytics",
  ],
  openGraph: {
    title: "Stats & Progression | LeagueSports",
    description:
      "See exactly where you stand. Track stats, earn badges, and climb the leaderboards.",
  },
};

export default function StatsPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">📊</span>
                <span className="text-sm text-slate-300">
                  Stats & Progression
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Track Your <span className="text-amber-400">Journey</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                Every match tracked. Every stat analyzed. Our algorithm
                calculates your true skill level and shows you exactly where to
                improve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 py-3 rounded-full text-base"
                >
                  Start Tracking
                </Link>
              </div>
            </div>

            {/* Stats Preview Card */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl" />
              <div className="relative">
                {/* Player Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white">
                    A+
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">1,847</div>
                    <div className="text-sm text-slate-400">
                      Skill Rating • Top 5%
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-xl font-bold text-white">156</div>
                    <div className="text-[10px] text-slate-500">Matches</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-xl font-bold text-emerald-400">
                      72%
                    </div>
                    <div className="text-[10px] text-slate-500">Win Rate</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-xl font-bold text-white">8</div>
                    <div className="text-[10px] text-slate-500">Win Streak</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-xl font-bold text-white">#12</div>
                    <div className="text-[10px] text-slate-500">Rank</div>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <div className="text-xs text-slate-500 mb-2">
                    Recent Achievements
                  </div>
                  <div className="flex gap-2">
                    {["🏆", "🔥", "⚡", "🎯", "💎"].map((badge, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-lg"
                      >
                        {badge}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-xs text-slate-500">
                      +12
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Ratings & Badges */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-transparent to-transparent" />
        <div className="absolute top-1/3 right-0 sm:right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-4">
              Earn <span className="text-amber-400">Badges</span> & Climb the{" "}
              <span className="gradient-text">Ranks</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto">
              Our algorithm calculates your skill level. Complete challenges,
              unlock achievements, climb the ranks.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left: Skill Rating Card */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl" />
              <div className="relative">
                <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </span>
                  Skill Ratings
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      sport: "Sim Racing",
                      rating: 1847,
                      percent: 73,
                      tier: "Gold",
                      color: "from-red-500 to-orange-500",
                    },
                    {
                      sport: "Darts",
                      rating: 1562,
                      percent: 58,
                      tier: "Silver",
                      color: "from-sky-500 to-blue-500",
                    },
                    {
                      sport: "Padel",
                      rating: 1203,
                      percent: 35,
                      tier: "Bronze",
                      color: "from-orange-500 to-amber-500",
                    },
                  ].map((skill) => (
                    <div
                      key={skill.sport}
                      className="bg-slate-800/50 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white font-medium">
                          {skill.sport}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {skill.tier}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {skill.rating}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${skill.color} transition-all duration-1000`}
                          style={{ width: `${skill.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tier Legend */}
                <div className="flex justify-between mt-4 px-1">
                  {["Bronze", "Silver", "Gold", "Diamond"].map((tier, i) => (
                    <div key={tier} className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full mb-1 ${
                          i === 0
                            ? "bg-orange-600"
                            : i === 1
                            ? "bg-slate-400"
                            : i === 2
                            ? "bg-amber-400"
                            : "bg-sky-300"
                        }`}
                      />
                      <span className="text-[9px] text-slate-500">{tier}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Badges Grid */}
            <div className="lg:col-span-3 glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <span className="text-lg">🏆</span>
                    </span>
                    Achievements
                  </h3>
                  <span className="text-xs text-slate-500">12/48 Unlocked</span>
                </div>

                {/* Badge Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                  {[
                    {
                      name: "Speed Demon",
                      icon: "🏎️",
                      unlocked: true,
                      rarity: "rare",
                    },
                    {
                      name: "9-Dart Master",
                      icon: "🎯",
                      unlocked: true,
                      rarity: "epic",
                    },
                    {
                      name: "Ace Hunter",
                      icon: "⛳",
                      unlocked: true,
                      rarity: "common",
                    },
                    {
                      name: "Consistent",
                      icon: "📊",
                      unlocked: true,
                      rarity: "common",
                    },
                    {
                      name: "Night Owl",
                      icon: "🦉",
                      unlocked: true,
                      rarity: "rare",
                    },
                    {
                      name: "Hot Streak",
                      icon: "🔥",
                      unlocked: true,
                      rarity: "epic",
                    },
                    {
                      name: "Iron Will",
                      icon: "💪",
                      unlocked: false,
                      rarity: "legendary",
                    },
                    {
                      name: "Perfectionist",
                      icon: "✨",
                      unlocked: false,
                      rarity: "legendary",
                    },
                    {
                      name: "Team Player",
                      icon: "🤝",
                      unlocked: false,
                      rarity: "rare",
                    },
                    {
                      name: "Mentor",
                      icon: "🎓",
                      unlocked: false,
                      rarity: "epic",
                    },
                    {
                      name: "Champion",
                      icon: "👑",
                      unlocked: false,
                      rarity: "legendary",
                    },
                    {
                      name: "Legend",
                      icon: "⭐",
                      unlocked: false,
                      rarity: "legendary",
                    },
                  ].map((badge) => (
                    <div
                      key={badge.name}
                      className={`relative flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border transition-all group ${
                        badge.unlocked
                          ? badge.rarity === "legendary"
                            ? "bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/40 hover:border-amber-400"
                            : badge.rarity === "epic"
                            ? "bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/40 hover:border-purple-400"
                            : badge.rarity === "rare"
                            ? "bg-gradient-to-br from-sky-500/20 to-blue-600/20 border-sky-500/40 hover:border-sky-400"
                            : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                          : "bg-slate-900/50 border-slate-800 opacity-40"
                      }`}
                    >
                      <span
                        className={`text-xl sm:text-2xl ${
                          !badge.unlocked && "grayscale"
                        }`}
                      >
                        {badge.unlocked ? badge.icon : "🔒"}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 text-center leading-tight hidden sm:block">
                        {badge.name}
                      </span>
                      {badge.unlocked && badge.rarity === "legendary" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Recent Achievement */}
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <span className="text-xl">🔥</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-purple-400 font-medium">
                        Just Unlocked!
                      </p>
                      <p className="text-sm text-white font-semibold">
                        Hot Streak
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">2 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                📈
              </div>
              <h3 className="font-bold text-white mb-2">Skill Rating</h3>
              <p className="text-sm text-slate-400">
                Our ELO-based algorithm tracks your performance and calculates a
                true skill rating that reflects your ability.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                🏅
              </div>
              <h3 className="font-bold text-white mb-2">Achievements</h3>
              <p className="text-sm text-slate-400">
                Unlock badges for milestones, streaks, and special
                accomplishments. Show off your collection on your profile.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                📊
              </div>
              <h3 className="font-bold text-white mb-2">Detailed Analytics</h3>
              <p className="text-sm text-slate-400">
                Dive deep into your performance with charts, trends, and
                insights that show you exactly where to improve.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                🏆
              </div>
              <h3 className="font-bold text-white mb-2">Leaderboards</h3>
              <p className="text-sm text-slate-400">
                Compete for the top spots in global, community, and friend
                leaderboards. See how you stack up.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                📅
              </div>
              <h3 className="font-bold text-white mb-2">Match History</h3>
              <p className="text-sm text-slate-400">
                Review every match you&apos;ve ever played. Filter by opponent,
                date, format, or outcome.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-2xl mb-4">
                🎯
              </div>
              <h3 className="font-bold text-white mb-2">Goals & Challenges</h3>
              <p className="text-sm text-slate-400">
                Set personal goals and complete challenges to stay motivated and
                track your improvement over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
            Start tracking your progress today
          </h2>
          <p className="text-slate-400 mb-8">
            Join thousands of players using LeagueSports to measure and improve.
          </p>
          <Link
            href="/waitlist"
            className="btn-primary px-8 py-4 rounded-full text-base"
          >
            Get Early Access
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
