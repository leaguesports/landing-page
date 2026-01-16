import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Marketers - Grow Sports Communities & Drive Engagement",
  description:
    "Build viral sports communities with shareable achievements, social integrations, and engagement analytics. Turn players into brand advocates.",
  keywords: [
    "sports community marketing",
    "viral sports content",
    "community engagement tools",
    "sports social marketing",
    "athlete engagement platform",
    "sports event promotion",
  ],
  openGraph: {
    title: "For Marketers | LeagueSports",
    description: "Tools to build sports communities that market themselves.",
  },
};

export default function MarketersPage() {
  return (
    <MarketingLayout>
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">📈</span>
                <span className="text-sm text-slate-300">For Marketers</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Grow Your <span className="text-pink-400">Community</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                Turn casual players into passionate advocates. Create buzz
                around your events, drive engagement, and build communities that
                market themselves.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 py-3 rounded-full text-base"
                >
                  Start Growing
                </Link>
              </div>
            </div>

            {/* Growth Preview */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white">Community Growth</h3>
                  <span className="text-xs text-emerald-400 px-2 py-1 bg-emerald-500/20 rounded-full">
                    +47% this month
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-2xl font-bold text-white">2.4K</div>
                    <div className="text-[10px] text-slate-500">Members</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-2xl font-bold text-white">89%</div>
                    <div className="text-[10px] text-slate-500">Retention</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-2xl font-bold text-white">156</div>
                    <div className="text-[10px] text-slate-500">Shares</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Social shares</span>
                    <span className="text-emerald-400">+34%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-10 text-center">
            Tools to drive growth
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🚀",
                title: "Community Growth Tools",
                description:
                  "Invite systems, referral tracking, and viral loops built in.",
              },
              {
                icon: "📣",
                title: "Event Promotion",
                description:
                  "Create shareable event pages that drive registrations.",
              },
              {
                icon: "📱",
                title: "Social Sharing",
                description:
                  "One-click sharing of results, achievements, and highlights.",
              },
              {
                icon: "📊",
                title: "Engagement Analytics",
                description:
                  "Track what drives engagement and double down on what works.",
              },
              {
                icon: "🏆",
                title: "Leaderboard Widgets",
                description:
                  "Embed live leaderboards on your website or social profiles.",
              },
              {
                icon: "🎉",
                title: "Achievement Moments",
                description:
                  "Auto-generate shareable content when players hit milestones.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
            Ready to build something viral?
          </h2>
          <p className="text-slate-400 mb-8">
            Join marketers creating communities that grow themselves.
          </p>
          <Link
            href="/waitlist"
            className="btn-primary px-8 py-4 rounded-full text-base"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
