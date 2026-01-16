import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Features",
  description:
    "Discover LeagueSports features: tournament management, live brackets, stats tracking, skill ratings, and community tools for darts, padel, sim racing, and more.",
  keywords: [
    "sports tournament software",
    "league management platform",
    "sports statistics tracking",
    "live bracket system",
    "community sports platform",
    "skill rating system",
  ],
  openGraph: {
    title: "Product Features | LeagueSports",
    description:
      "Everything you need to track stats, run tournaments, and build communities for your favorite sports.",
  },
};

const features = [
  {
    title: "Sport Dashboards",
    description:
      "Every sport has unique metrics. Our dashboards are purpose-built with the exact stats, scoring systems, and analytics each sport demands.",
    href: "/product/dashboards",
    icon: "🎮",
    gradient: "from-cyan-500 to-blue-600",
    highlights: [
      "Sport-specific metrics",
      "Custom scoring",
      "Real-time analytics",
      "Performance trends",
    ],
  },
  {
    title: "Tournaments & Leagues",
    description:
      "Run professional brackets, round robins, and Swiss tournaments. From pub leagues to esports championships—all with live updates.",
    href: "/product/tournaments",
    icon: "🏆",
    gradient: "from-emerald-500 to-green-600",
    highlights: [
      "Single/Double Elimination",
      "Round Robin",
      "Swiss System",
      "Live Brackets",
    ],
  },
  {
    title: "Stats & Progression",
    description:
      "Track every stat, earn badges, and watch your rating climb. Our ELO-based algorithm calculates your true skill level.",
    href: "/product/stats",
    icon: "📊",
    gradient: "from-amber-500 to-orange-600",
    highlights: [
      "Skill Rating",
      "Achievement Badges",
      "Leaderboards",
      "Performance Analytics",
    ],
  },
  {
    title: "Communities",
    description:
      "Build groups, organize events, and connect with players who share your passion. Your hub for social play and friendly competition.",
    href: "/product/communities",
    icon: "👥",
    gradient: "from-violet-500 to-purple-600",
    highlights: [
      "Group Management",
      "Event Scheduling",
      "Activity Feed",
      "Member Roles",
    ],
  },
  {
    title: "Live Mode",
    description:
      "Cast scores to big screens, enable spectator views, and create that professional tournament atmosphere anywhere.",
    href: "/product/live",
    icon: "📺",
    gradient: "from-sky-500 to-blue-600",
    highlights: [
      "Jumbotron Display",
      "Spectator View",
      "Real-time Updates",
      "Multi-court View",
    ],
  },
  {
    title: "Integrations",
    description:
      "Connect with your favorite tools and hardware. From smart dartboards to sim racing rigs—data flows automatically.",
    href: "/product/integrations",
    icon: "⚡",
    gradient: "from-pink-500 to-rose-600",
    highlights: [
      "Smart Hardware",
      "Scoring Systems",
      "Social Platforms",
      "Calendar Sync",
    ],
  },
];

const stats = [
  { value: "50ms", label: "Average sync latency" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "8+", label: "Sports supported" },
  { value: "∞", label: "Players per event" },
];

export default function ProductPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-slate-300">Product Overview</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
              Everything You Need to{" "}
              <span className="gradient-text">Level Up</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400">
              Professional-grade tools designed for recreational sports. Whether
              you&apos;re tracking practice sessions or running championship
              tournaments, LeagueSports has you covered.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="glass-card rounded-2xl p-6 mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary font-heading">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-heading text-white mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="px-2 py-1 rounded-md text-xs bg-slate-800/50 text-slate-400"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Get Started in <span className="gradient-text">3 Steps</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              No complicated setup. No learning curve. Just create an account
              and start playing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description:
                  "Sign up free in seconds. No credit card required during beta.",
                icon: "👤",
              },
              {
                step: "02",
                title: "Pick Your Sports",
                description:
                  "Select the sports you play. Each gets its own custom dashboard.",
                icon: "🎯",
              },
              {
                step: "03",
                title: "Start Playing",
                description:
                  "Log matches, track stats, or create tournaments. Everything syncs instantly.",
                icon: "🚀",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div className="text-xs text-primary font-mono mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-4">
                Ready to transform how you play?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of players already using LeagueSports. Free
                during beta—get in before the competition.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-8 py-4 rounded-full text-base w-full sm:w-auto"
                >
                  Get Early Access
                </Link>
                <Link
                  href="/solutions"
                  className="btn-secondary px-8 py-4 rounded-full text-base w-full sm:w-auto"
                >
                  View Solutions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
