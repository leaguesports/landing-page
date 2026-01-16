import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Coaches - Manage Teams & Track Development",
  description:
    "Data-driven coaching tools for sports coaches. Track player development, manage rosters, analyze performance trends, and build winning teams with LeagueSports.",
  keywords: [
    "sports coaching software",
    "player development tracking",
    "team management app",
    "coaching analytics",
    "performance tracking",
    "athlete management",
  ],
  openGraph: {
    title: "For Coaches | LeagueSports",
    description:
      "Build winners with data-driven coaching. Track every player's journey.",
  },
};

const features = [
  {
    icon: "👥",
    title: "Team Roster Management",
    description:
      "Keep track of all your players in one place. Contact info, skill levels, attendance history, and notes.",
    highlight: "Unlimited players",
  },
  {
    icon: "📈",
    title: "Development Tracking",
    description:
      "Watch each player's progression over time. See what's working and where they need help.",
    highlight: "Visual trends",
  },
  {
    icon: "📊",
    title: "Performance Analytics",
    description:
      "Deep dive into stats for individuals and the team as a whole. Identify patterns you'd miss otherwise.",
    highlight: "AI insights",
  },
  {
    icon: "📝",
    title: "Session Notes",
    description:
      "Log observations after practice or matches. Build a history of each player's coaching journey.",
    highlight: "Searchable",
  },
  {
    icon: "🎯",
    title: "Goal Setting",
    description:
      "Set targets for players and track progress toward them. Keep everyone motivated and accountable.",
    highlight: "Milestone alerts",
  },
  {
    icon: "📅",
    title: "Practice Planning",
    description:
      "Schedule sessions, track attendance, and plan drills. Everything your players need to know in one place.",
    highlight: "Auto reminders",
  },
];

const testimonials = [
  {
    quote:
      "I used to rely on gut feeling for who was improving. Now I have actual data. It's changed how I coach completely.",
    author: "David M.",
    role: "Darts Coach",
    players: "12 students",
  },
  {
    quote:
      "Being able to show a player their progress chart is worth everything. They can see the improvement even when they can't feel it yet.",
    author: "Ana R.",
    role: "Padel Instructor",
    players: "Academy coach",
  },
];

export default function CoachesPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">📋</span>
                <span className="text-sm text-slate-300">For Coaches</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Coach with <span className="text-violet-400">Real Data</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-4">
                Stop guessing who&apos;s improving. Track every player&apos;s
                journey with concrete metrics and development trends.
              </p>
              <p className="text-base text-slate-500 mb-8">
                Whether you&apos;re coaching a few students or running an
                academy, LeagueSports gives you the insights to build winners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 py-3 rounded-full text-base"
                >
                  Get Coach Access
                </Link>
                <Link
                  href="/product/stats"
                  className="btn-secondary px-6 py-3 rounded-full text-base"
                >
                  See Analytics Tools
                </Link>
              </div>
            </div>

            {/* Coach Dashboard Preview */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    Team Overview
                  </span>
                  <span className="text-[10px] text-violet-400 px-2 py-0.5 bg-violet-500/10 rounded-full">
                    8 Players
                  </span>
                </div>

                {/* Player list preview */}
                <div className="space-y-2 mb-4">
                  {[
                    { name: "Alex K.", trend: "+12%", status: "improving" },
                    { name: "Jordan P.", trend: "+8%", status: "improving" },
                    { name: "Sam W.", trend: "+2%", status: "steady" },
                    {
                      name: "Riley T.",
                      trend: "-3%",
                      status: "needs attention",
                    },
                  ].map((player) => (
                    <div
                      key={player.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-white">
                          {player.name.charAt(0)}
                        </div>
                        <span className="text-sm text-white">
                          {player.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${
                            player.status === "improving"
                              ? "text-emerald-400"
                              : player.status === "steady"
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {player.trend}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            player.status === "improving"
                              ? "bg-emerald-400"
                              : player.status === "steady"
                              ? "bg-amber-400"
                              : "bg-red-400"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-emerald-400">
                      75%
                    </div>
                    <div className="text-[9px] text-slate-500">Improving</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-white">24</div>
                    <div className="text-[9px] text-slate-500">Sessions</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-white">156</div>
                    <div className="text-[9px] text-slate-500">Matches</div>
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
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Tools for <span className="gradient-text">Modern Coaching</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to track, analyze, and develop your players
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-6 hover:border-violet-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{feature.icon}</div>
                  <span className="text-[10px] text-violet-400 px-2 py-0.5 bg-violet-500/10 rounded-full">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-4xl opacity-10">
                  &quot;
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div>
                  <div className="font-medium text-white">
                    {testimonial.author}
                  </div>
                  <div className="text-xs text-slate-500">
                    {testimonial.role} • {testimonial.players}
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
            Ready to coach with data?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Get early access to coaching tools. Track your players&apos;
            development from day one.
          </p>
          <Link
            href="/waitlist"
            className="btn-primary px-8 py-4 rounded-full text-base"
          >
            Get Coach Access
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
