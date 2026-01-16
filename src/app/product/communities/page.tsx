import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communities - Build Groups & Organize Events",
  description:
    "Create thriving sports communities with LeagueSports. Manage groups, schedule events, track member progress, and build lasting connections with players who share your passion.",
  keywords: [
    "sports community platform",
    "player group management",
    "sports event scheduling",
    "club management software",
    "sports social network",
    "recreational sports groups",
  ],
  openGraph: {
    title: "Communities | LeagueSports",
    description:
      "Build your tribe. Create groups, organize events, and connect with players.",
  },
};

const features = [
  {
    icon: "🏠",
    title: "Group Management",
    description:
      "Create public or private communities. Set rules, manage members, and build your player base.",
    detail: "Unlimited members per group",
  },
  {
    icon: "📅",
    title: "Event Scheduling",
    description:
      "Plan tournaments, casual meetups, and practice sessions. Send invites and track RSVPs.",
    detail: "Calendar sync included",
  },
  {
    icon: "📰",
    title: "Activity Feed",
    description:
      "Stay updated with match results, achievements, and community announcements.",
    detail: "Real-time updates",
  },
  {
    icon: "👑",
    title: "Member Roles",
    description:
      "Assign admins, moderators, and custom roles. Control who can do what.",
    detail: "Fine-grained permissions",
  },
  {
    icon: "💬",
    title: "Discussion Boards",
    description: "Chat with members, share strategies, and coordinate matches.",
    detail: "Threaded conversations",
  },
  {
    icon: "📊",
    title: "Community Stats",
    description:
      "Track community leaderboards, match history, and growth metrics.",
    detail: "Engagement analytics",
  },
];

const communityTypes = [
  {
    name: "Local Pub League",
    description: "Weekly regulars competing for bragging rights",
    members: "15-50 players",
    icon: "🍺",
  },
  {
    name: "Sports Club",
    description: "Official club with multiple skill levels",
    members: "50-200 players",
    icon: "🏟️",
  },
  {
    name: "Friend Group",
    description: "Casual crew tracking their matches",
    members: "5-15 players",
    icon: "👥",
  },
  {
    name: "Online Community",
    description: "Global players connected by passion",
    members: "100+ players",
    icon: "🌍",
  },
];

export default function CommunitiesProductPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">👥</span>
                <span className="text-sm text-slate-300">Communities</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Build Your <span className="text-violet-400">Tribe</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-4">
                Create groups, organize events, and connect with players who
                share your passion. Your hub for social play.
              </p>
              <p className="text-base text-slate-500 mb-8">
                Whether it&apos;s a weekly pub league, a sports club, or just
                your friend group—communities keep everyone connected and coming
                back.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 py-3 rounded-full text-base"
                >
                  Start Your Community
                </Link>
                <Link
                  href="/solutions/venues"
                  className="btn-secondary px-6 py-3 rounded-full text-base"
                >
                  For Venues
                </Link>
              </div>
            </div>

            {/* Community Preview */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl">
                      🎯
                    </div>
                    <div>
                      <h3 className="font-bold text-white">
                        The Crown Darts League
                      </h3>
                      <p className="text-xs text-slate-500">
                        32 members • Est. 2024
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                    Active
                  </span>
                </div>

                {/* Recent activity */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                      🏆
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-white">
                        <span className="font-medium">Mike T.</span> won the
                        Tuesday tournament
                      </p>
                      <p className="text-[10px] text-slate-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                      📅
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-white">
                        New event:{" "}
                        <span className="font-medium">Thursday Doubles</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        8 spots remaining
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member preview */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {["M", "S", "J", "R", "A"].map((initial, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs font-medium text-white"
                      >
                        {initial}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-400">
                      +27
                    </div>
                  </div>
                  <button className="text-xs text-violet-400 hover:text-violet-300">
                    View all →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Types */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Communities of <span className="gradient-text">All Sizes</span>
            </h2>
            <p className="text-slate-400">
              From tight friend groups to international clubs
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {communityTypes.map((type) => (
              <div
                key={type.name}
                className="glass-card rounded-xl p-5 text-center hover:border-violet-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{type.icon}</div>
                <h3 className="font-bold text-white mb-1 text-sm">
                  {type.name}
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  {type.description}
                </p>
                <p className="text-[10px] text-violet-400">{type.members}</p>
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
              Everything You Need to Build a Community
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Tools that make organizing effortless and keep members engaged
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-6 hover:border-violet-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center text-2xl">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] text-violet-400 px-2 py-0.5 bg-violet-500/10 rounded-full">
                    {feature.detail}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
            Ready to build something?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Create your first community in minutes. Free during beta—grow your
            player base with no limits.
          </p>
          <Link
            href="/waitlist"
            className="btn-primary px-8 py-4 rounded-full text-base"
          >
            Start Your Community
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
