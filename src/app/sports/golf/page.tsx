import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.golf;

export const metadata: Metadata = {
  title: "Golf & Sim Golf South Africa - Handicap Tracking & Tournaments",
  description:
    "Track your golf handicap, join tournaments, and connect with golfers across South Africa. Perfect for course play and sim golf at venues nationwide.",
  alternates: { canonical: "/sports/golf" },
  keywords: [
    "golf South Africa",
    "golf handicap tracking",
    "sim golf SA",
    "golf tournaments South Africa",
    "Trackman golf SA",
    "golf leagues Johannesburg",
    "indoor golf South Africa",
    "X-Golf",
    "Full Swing simulator",
  ],
  openGraph: {
    title: "Golf & Sim Golf South Africa - Handicap Tracking & Tournaments",
    description:
      "Track your golf handicap, join tournaments, and connect with golfers across South Africa.",
    url: "https://leaguesports.co.za/sports/golf",
  },
};

const playModes = [
  {
    name: "Sim Rounds",
    description: "Full 18-hole rounds on world-famous courses.",
    icon: "🖥️",
    bestFor: "Weather-proof golf, evening play",
  },
  {
    name: "Course Play",
    description: "Log rounds at real courses. Hole-by-hole scoring.",
    icon: "⛳",
    bestFor: "Traditional golf, handicap tracking",
  },
  {
    name: "Practice Mode",
    description: "Driving range sessions with shot tracking.",
    icon: "🎯",
    bestFor: "Improving your swing",
  },
  {
    name: "Competitions",
    description: "Stableford, medal, or matchplay tournaments.",
    icon: "🏆",
    bestFor: "Club championships, leagues",
  },
];

const features = [
  {
    icon: "📊",
    title: "Handicap Tracking",
    description:
      "Automatic handicap calculation from all your rounds. Course and sim play combined.",
  },
  {
    icon: "🖥️",
    title: "Sim Integration",
    description:
      "Connect Trackman, Full Swing, and other simulators. Import rounds automatically.",
  },
  {
    icon: "📱",
    title: "Round Logging",
    description:
      "Score hole-by-hole. Track fairways, GIR, putts, and penalties.",
  },
  {
    icon: "📈",
    title: "Performance Stats",
    description:
      "See your strengths and weaknesses. Driving accuracy, approach play, short game.",
  },
  {
    icon: "👥",
    title: "Fourball Leagues",
    description:
      "Join or create leagues at your club or sim venue. Weekly competitions.",
  },
  {
    icon: "🏆",
    title: "Tournament Mode",
    description:
      "Run stableford, medal, or matchplay events with live leaderboards.",
  },
];

const venues = [
  { name: "X-Golf Sandton", location: "Sandton, JHB", type: "Sim" },
  { name: "Golfing World", location: "Fourways, JHB", type: "Sim" },
  { name: "The Range CPT", location: "Cape Town", type: "Sim" },
  { name: "Randpark Golf Club", location: "Randburg, JHB", type: "Course" },
  { name: "Steenberg Golf Club", location: "Cape Town", type: "Course" },
  { name: "Durban Country Club", location: "Durban", type: "Course" },
];

export default function GolfPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">⛳</span>
                <span className="text-sm text-slate-300">
                  Course Play & Sim Golf 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Golf in{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                From the fairway to the simulator. Track your handicap, join
                leagues, and compete in tournaments. One platform for all your
                golf.
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

            {/* Handicap & Stats Card */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-3xl" />
              <div className="relative">
                {/* Handicap Display */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">12.4</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Handicap Index</p>
                    <p className="text-xs text-emerald-400">↓ 1.2 this month</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Last 20 rounds
                    </p>
                  </div>
                </div>

                {/* Recent Rounds */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Recent Rounds</p>
                  <div className="space-y-2">
                    {[
                      {
                        course: "Randpark Firethorn",
                        score: 84,
                        diff: "+12",
                        type: "Course",
                      },
                      {
                        course: "Pebble Beach (Sim)",
                        score: 82,
                        diff: "+10",
                        type: "Sim",
                      },
                      {
                        course: "Steenberg",
                        score: 86,
                        diff: "+14",
                        type: "Course",
                      },
                    ].map((round, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              round.type === "Sim"
                                ? "bg-sky-500/20 text-sky-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {round.type}
                          </span>
                          <span className="text-sm text-white">
                            {round.course}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-white">
                            {round.score}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            ({round.diff})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Avg Score", value: "84" },
                    { label: "Best", value: "76" },
                    { label: "Rounds", value: "32" },
                    { label: "Eagles", value: "3" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-2 rounded-lg bg-slate-800/50"
                    >
                      <div className="text-lg font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {stat.label}
                      </div>
                    </div>
                  ))}
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
              { value: "12,000+", label: "Golfers" },
              { value: "85K+", label: "Rounds Logged" },
              { value: "450+", label: "Courses" },
              { value: "45+", label: "Sim Venues" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Play Modes */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Play Your Way
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Course play, sim golf, or practice sessions. Everything tracked in
              one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {playModes.map((mode) => (
              <div
                key={mode.name}
                className="glass-card rounded-xl p-5 hover:border-emerald-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{mode.icon}</div>
                <h3 className="font-bold text-white mb-2">{mode.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{mode.description}</p>
                <div className="text-xs text-emerald-400">
                  Best for: {mode.bestFor}
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
              Everything You Need for Golf
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Professional tools for South African golfers, from handicap
              tracking to tournament management.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center text-2xl mb-4">
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
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏌️</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Weekend Golfers</h4>
                  <p className="text-xs text-emerald-400/80">
                    Track your progress
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Finally have a real handicap. Can see exactly where
                I&apos;m improving.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-sky-500/5 to-transparent border-sky-500/20 hover:border-sky-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <span className="text-2xl">🖥️</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Sim Golfers</h4>
                  <p className="text-xs text-sky-400/80">
                    Play anytime, anywhere
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Sim rounds count toward my handicap. Winter golf solved.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20 hover:border-green-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Sim Venues</h4>
                  <p className="text-xs text-green-400/80">Run leagues easily</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Our weekly league practically runs itself now.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Fans & Followers</h4>
                  <p className="text-xs text-teal-400/80">Live leaderboards</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Follow my mate&apos;s round hole-by-hole. Live
                leaderboard during club comps.&quot;
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
              Popular Golf Venues in SA
            </h2>
            <p className="text-slate-400">
              Sim venues and courses across South Africa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="glass-card rounded-xl p-4 hover:border-emerald-500/30 transition-colors flex items-center gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                    venue.type === "Sim"
                      ? "bg-gradient-to-br from-sky-500 to-blue-600"
                      : "bg-gradient-to-br from-emerald-500 to-green-600"
                  }`}
                >
                  {venue.type === "Sim" ? "🖥️" : "⛳"}
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
              + 450 courses and 45 sim venues across all provinces
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Lower Your Handicap?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of South African golfers tracking their progress.
                Course play and sim rounds, all in one place.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
              .filter((s) => s.slug !== "golf")
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
