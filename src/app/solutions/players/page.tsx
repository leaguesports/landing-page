import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Players - Track Stats & Improve Your Game",
  description:
    "Stop guessing how good you are. Track your matches, see real stats, earn rankings, and compete on leaderboards. Free player accounts for darts, padel, sim racing, and more.",
  keywords: [
    "sports statistics app",
    "player stats tracking",
    "skill rating system",
    "sports leaderboard",
    "match history",
    "performance analytics",
  ],
  openGraph: {
    title: "For Players | LeagueSports",
    description:
      "Track your journey, see where you really stand, and improve with real data.",
  },
};

const features = [
  {
    icon: "📊",
    title: "Personal Stats Dashboard",
    description:
      "See all your performance data in one place. Win rates, averages, trends—everything you need to understand your game.",
    highlight: "Updated in real-time",
  },
  {
    icon: "📈",
    title: "Skill Rating System",
    description:
      "Our ELO-based algorithm calculates your true skill level based on match results. Beat better players, climb faster.",
    highlight: "Fair & transparent",
  },
  {
    icon: "🏆",
    title: "Leaderboards",
    description:
      "Compete for the top spots in global, community, and friend leaderboards. See exactly where you rank.",
    highlight: "Multiple categories",
  },
  {
    icon: "🏅",
    title: "Achievement Badges",
    description:
      "Unlock badges for milestones, streaks, and special accomplishments. Build your trophy case.",
    highlight: "100+ badges",
  },
  {
    icon: "📅",
    title: "Match History",
    description:
      "Review every match you've played. Filter by opponent, date, venue, or outcome. Never forget a game.",
    highlight: "Unlimited storage",
  },
  {
    icon: "👥",
    title: "Find Players",
    description:
      "Connect with players at your skill level. Never struggle to find a match—the app does it for you.",
    highlight: "Smart matching",
  },
];

const testimonials = [
  {
    quote:
      "I always thought I was pretty good at darts until I saw my actual stats. Three months later, my average went from 45 to 62. The data doesn't lie.",
    author: "Marcus P.",
    location: "London, UK",
    sport: "Darts",
    improvement: "+38% average",
  },
  {
    quote:
      "Love being able to look back at matches from months ago. I can see exactly when I started improving and what changed.",
    author: "Elena S.",
    location: "Barcelona, Spain",
    sport: "Padel",
    improvement: "200+ matches logged",
  },
  {
    quote:
      "The leaderboard keeps me motivated. Being able to see I'm #12 in my city makes me want to hit #10.",
    author: "James T.",
    location: "Chicago, USA",
    sport: "Pool",
    improvement: "Rank #12 → #8",
  },
];

const journeySteps = [
  {
    stage: "Week 1",
    title: "Start Tracking",
    description: "Log your first few matches. See baseline stats.",
    icon: "📱",
  },
  {
    stage: "Month 1",
    title: "Spot Patterns",
    description: "Identify strengths and weaknesses in your data.",
    icon: "🔍",
  },
  {
    stage: "Month 3",
    title: "See Progress",
    description: "Watch your trend lines climb. Celebrate milestones.",
    icon: "📈",
  },
  {
    stage: "Ongoing",
    title: "Compete & Improve",
    description: "Challenge yourself on leaderboards. Keep pushing.",
    icon: "🏆",
  },
];

export default function PlayersPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🎮</span>
                <span className="text-sm text-slate-300">For Players</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Know Your <span className="text-sky-400">True Level</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-4">
                Stop guessing how good you are. Track every match, earn your
                rating, and see exactly where you stand against the competition.
              </p>
              <p className="text-base text-slate-500 mb-8">
                Whether you&apos;re a casual player looking to improve or a
                competitive player chasing rankings—your stats tell the real
                story.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 py-3 rounded-full text-base"
                >
                  Start Tracking Free
                </Link>
                <Link
                  href="/product/stats"
                  className="btn-secondary px-6 py-3 rounded-full text-base"
                >
                  See How It Works
                </Link>
              </div>
            </div>

            {/* Stats Preview Card */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    Your Profile
                  </span>
                  <span className="text-[10px] text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                    +127 this month
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                    A+
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">1,847</div>
                    <div className="text-sm text-slate-400">
                      Skill Rating • Top 5%
                    </div>
                  </div>
                </div>
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
                    <div className="text-xl font-bold text-amber-400">8</div>
                    <div className="text-[10px] text-slate-500">Streak</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-xl font-bold text-white">#12</div>
                    <div className="text-[10px] text-slate-500">Rank</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {["🏆", "🔥", "⚡", "🎯", "💎"].map((badge, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-lg hover:scale-110 transition-transform cursor-pointer"
                        title="Achievement badge"
                      >
                        {badge}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">+12 more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Journey */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Your <span className="gradient-text">Improvement Journey</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              See how players typically progress with LeagueSports
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {journeySteps.map((step, i) => (
              <div key={step.stage} className="relative">
                {i < journeySteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent z-0" />
                )}
                <div className="glass-card rounded-xl p-5 relative z-10">
                  <div className="text-2xl mb-3">{step.icon}</div>
                  <div className="text-[10px] text-primary font-mono uppercase tracking-wider mb-1">
                    {step.stage}
                  </div>
                  <h3 className="font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-slate-400">{step.description}</p>
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
              Everything a Player Needs
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Tools designed by players, for players. No fluff—just what helps
              you improve.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-6 hover:border-sky-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{feature.icon}</div>
                  <span className="text-[10px] text-sky-400 px-2 py-0.5 bg-sky-500/10 rounded-full">
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

      {/* Testimonials */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Real Players, <span className="gradient-text">Real Results</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-4xl opacity-10">
                  &quot;
                </div>
                <div className="relative">
                  <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white text-sm">
                        {testimonial.author}
                      </div>
                      <div className="text-xs text-slate-500">
                        {testimonial.location} • {testimonial.sport}
                      </div>
                    </div>
                    <div className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded">
                      {testimonial.improvement}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
            Ready to see where you really stand?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of players tracking their progress. Free during
            beta—your stats, your journey, your improvement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/waitlist"
              className="btn-primary px-8 py-4 rounded-full text-base"
            >
              Get Started Free
            </Link>
            <Link
              href="/product/stats"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Learn about stats tracking →
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
