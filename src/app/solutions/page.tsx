import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions - Tools for Players, Coaches, Venues & More",
  description:
    "LeagueSports has specialized tools for everyone in recreational sports. Solutions for players tracking stats, coaches managing teams, venues running leagues, and officials scoring matches.",
  keywords: [
    "sports management solutions",
    "player tracking tools",
    "coach management software",
    "venue league software",
    "referee scoring app",
    "sports community platform",
  ],
  openGraph: {
    title: "Solutions | LeagueSports",
    description: "Purpose-built tools for every role in recreational sports.",
  },
};

const solutions = [
  {
    title: "For Players",
    description:
      "Track your progress, find matches, and compete with friends. Get the tools to improve your game and see exactly where you stand.",
    href: "/solutions/players",
    icon: "🎮",
    gradient: "from-sky-500 to-blue-600",
    features: [
      "Personal stats dashboard",
      "Skill rating & rankings",
      "Match history & analytics",
      "Achievement badges",
    ],
  },
  {
    title: "For Coaches",
    description:
      "Manage your players, track their development, and run effective training sessions. Everything you need to build winning teams.",
    href: "/solutions/coaches",
    icon: "📋",
    gradient: "from-amber-500 to-orange-600",
    features: [
      "Team management",
      "Player progress tracking",
      "Practice session planning",
      "Performance reports",
    ],
  },
  {
    title: "For Referees",
    description:
      "Score matches in real-time, manage tournament brackets, and ensure fair play. Professional tools for running smooth events.",
    href: "/solutions/referees",
    icon: "🏁",
    gradient: "from-emerald-500 to-green-600",
    features: [
      "Live scoring interface",
      "Digital sign-off",
      "Bracket management",
      "Dispute resolution",
    ],
  },
  {
    title: "For Venues",
    description:
      "Run leagues that keep customers coming back. Display live scores, manage tournaments, and build a loyal player community.",
    href: "/solutions/venues",
    icon: "🏟️",
    gradient: "from-violet-500 to-purple-600",
    features: [
      "Jumbotron displays",
      "League management",
      "Customer engagement",
      "Recurring events",
    ],
  },
  {
    title: "For Marketers",
    description:
      "Grow your sports community, drive engagement, and create buzz around your events. Tools to turn players into advocates.",
    href: "/solutions/marketers",
    icon: "📈",
    gradient: "from-pink-500 to-rose-600",
    features: [
      "Community growth tools",
      "Event promotion",
      "Social sharing",
      "Engagement analytics",
    ],
  },
];

export default function SolutionsPage() {
  return (
    <MarketingLayout>
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-slate-300">Solutions</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
              Built for <span className="gradient-text">Everyone</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400">
              Whether you&apos;re a player looking to improve, a coach building
              a team, or a venue running leagues — we&apos;ve got the tools you
              need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution) => (
              <Link
                key={solution.href}
                href={solution.href}
                className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all group"
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${solution.gradient} flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform`}
                >
                  {solution.icon}
                </div>
                <h3 className="text-xl font-bold font-heading text-white mb-2 group-hover:text-primary transition-colors">
                  {solution.title}
                </h3>
                <p className="text-slate-400 text-sm mb-5">
                  {solution.description}
                </p>
                <div className="space-y-2">
                  {solution.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <svg
                        className="w-4 h-4 text-emerald-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
            Ready to get started?
          </h2>
          <p className="text-slate-400 mb-8">
            Join thousands already using LeagueSports to level up their game.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/waitlist"
              className="btn-primary px-8 py-4 rounded-full text-base w-full sm:w-auto"
            >
              Get Early Access
            </Link>
            <Link
              href="/product"
              className="btn-secondary px-8 py-4 rounded-full text-base w-full sm:w-auto"
            >
              View All Features
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
