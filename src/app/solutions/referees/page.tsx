import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Referees & Officials - Score Matches Professionally",
  description:
    "Digital scoring tools for referees and officials. Score matches from any device, instant result verification, and no more paper score sheets. Perfect for tournaments and leagues.",
  keywords: [
    "referee scoring app",
    "digital scorecard",
    "tournament officiating",
    "match scoring software",
    "sports official tools",
    "electronic scoring",
  ],
  openGraph: {
    title: "For Referees | LeagueSports",
    description:
      "Score matches professionally. Digital tools that make officiating seamless.",
  },
};

const features = [
  {
    icon: "📱",
    title: "Mobile Scoring",
    description:
      "Score matches from your phone or tablet. Large buttons, intuitive interface, works offline.",
    highlight: "Any device",
  },
  {
    icon: "✅",
    title: "Digital Sign-off",
    description:
      "Players confirm results on screen. No paper, no disputes—results are locked instantly.",
    highlight: "Dispute-free",
  },
  {
    icon: "📺",
    title: "Live Display Sync",
    description:
      "Your scores appear on spectator displays in real-time. Create that professional atmosphere.",
    highlight: "Instant sync",
  },
  {
    icon: "📋",
    title: "Match Assignment",
    description:
      "Get notified when you're assigned to a match. All details in one place—table, players, rules.",
    highlight: "Auto-assigned",
  },
  {
    icon: "📊",
    title: "Official Stats",
    description:
      "Track your officiating history. Matches worked, events covered, experience level.",
    highlight: "Build your record",
  },
  {
    icon: "⏱️",
    title: "Timer & Clock Tools",
    description:
      "Built-in shot clocks, break timers, and match duration tracking. Everything you need on one screen.",
    highlight: "All-in-one",
  },
];

const workflow = [
  {
    step: "1",
    title: "Get Assigned",
    description: "Receive notification with match details",
    icon: "📩",
  },
  {
    step: "2",
    title: "Score the Match",
    description: "Tap to record points, fouls, and game events",
    icon: "📱",
  },
  {
    step: "3",
    title: "Player Sign-off",
    description: "Both players confirm the final result",
    icon: "✍️",
  },
  {
    step: "4",
    title: "Auto-Submit",
    description: "Results sync to brackets and standings instantly",
    icon: "🚀",
  },
];

export default function RefereesPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🏁</span>
                <span className="text-sm text-slate-300">For Referees</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Officiate with <span className="text-rose-400">Confidence</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-4">
                No more paper score sheets. Score matches digitally, get instant
                player sign-off, and sync results to displays in real-time.
              </p>
              <p className="text-base text-slate-500 mb-8">
                Whether you&apos;re officiating a casual league night or a
                championship final, LeagueSports gives you the tools to run
                flawless matches.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 py-3 rounded-full text-base"
                >
                  Get Referee Access
                </Link>
                <Link
                  href="/product/live"
                  className="btn-secondary px-6 py-3 rounded-full text-base"
                >
                  See Live Scoring
                </Link>
              </div>
            </div>

            {/* Scoring Interface Preview */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE SCORING
                    </span>
                  </div>
                  <span className="text-[10px] text-rose-400 px-2 py-0.5 bg-rose-500/10 rounded-full">
                    Match #12
                  </span>
                </div>

                {/* Scoring interface mock */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center flex-1">
                      <div className="text-sm text-white font-medium mb-1">
                        Player A
                      </div>
                      <div className="text-4xl font-bold text-emerald-400 font-heading">
                        3
                      </div>
                    </div>
                    <div className="text-slate-600 text-sm">vs</div>
                    <div className="text-center flex-1">
                      <div className="text-sm text-white font-medium mb-1">
                        Player B
                      </div>
                      <div className="text-4xl font-bold text-slate-400 font-heading">
                        1
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-3 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                      + Point A
                    </button>
                    <button className="py-3 rounded-lg bg-slate-700/50 text-slate-300 text-sm font-medium">
                      + Point B
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Leg 4 of 5</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Synced to display
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Simple <span className="gradient-text">Officiating Workflow</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From assignment to final result in four easy steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((item, i) => (
              <div key={item.step} className="relative">
                {i < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-rose-500/50 to-transparent z-0" />
                )}
                <div className="glass-card rounded-xl p-5 relative z-10 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-[10px] text-rose-400 font-mono uppercase tracking-wider mb-1">
                    Step {item.step}
                  </div>
                  <h3 className="font-bold text-white mb-1 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400">{item.description}</p>
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
              Tools Built for Officials
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to run matches professionally
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-6 hover:border-rose-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{feature.icon}</div>
                  <span className="text-[10px] text-rose-400 px-2 py-0.5 bg-rose-500/10 rounded-full">
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

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
            Ready to officiate like a pro?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Get early access to referee tools. No more paper, no more disputes.
          </p>
          <Link
            href="/waitlist"
            className="btn-primary px-8 py-4 rounded-full text-base"
          >
            Get Referee Access
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
