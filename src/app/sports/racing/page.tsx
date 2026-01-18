import type { Metadata } from "next";
import Link from "next/link";
import { sports, sportsList } from "@/config/sports";

const sport = sports.racing;

export const metadata: Metadata = {
  title: "Sim Racing South Africa - Leagues, Championships & Live Timing",
  description:
    "South Africa's home for sim racing. Join leagues, compete in championships, and track your lap times across iRacing, ACC, F1, and more.",
  alternates: { canonical: "/sports/racing" },
  keywords: [
    "sim racing South Africa",
    "iRacing SA",
    "ACC South Africa",
    "sim racing leagues",
    "esports racing SA",
    "F1 game leagues",
    "virtual motorsport SA",
  ],
  openGraph: {
    title: "Sim Racing South Africa - Leagues, Championships & Live Timing",
    description:
      "South Africa's home for sim racing. Join leagues and compete in championships.",
    url: "https://leaguesports.co.za/sports/racing",
  },
};

const sims = [
  { name: "iRacing", icon: "🏎️", color: "from-red-500 to-orange-500" },
  { name: "ACC", icon: "🏁", color: "from-green-500 to-emerald-500" },
  { name: "F1 24", icon: "🔴", color: "from-red-600 to-red-400" },
  { name: "Gran Turismo", icon: "🎮", color: "from-blue-500 to-indigo-500" },
  { name: "rFactor 2", icon: "⚙️", color: "from-slate-500 to-slate-400" },
  { name: "Automobilista 2", icon: "🇧🇷", color: "from-yellow-500 to-green-500" },
];

const features = [
  {
    icon: "🏆",
    title: "Championship Management",
    description:
      "Run full seasons with points, drops, and custom scoring. Automatic standings updates.",
  },
  {
    icon: "⏱️",
    title: "Live Timing",
    description:
      "Real-time timing during races. Gaps, sector times, and position changes.",
  },
  {
    icon: "📊",
    title: "Driver Ratings",
    description:
      "Track your iRating equivalent across all sims. Fair matchmaking for competitive racing.",
  },
  {
    icon: "🔴",
    title: "Broadcast Integration",
    description:
      "Overlay data for streamers. Professional graphics for your league broadcasts.",
  },
  {
    icon: "⚠️",
    title: "Incident Tracking",
    description:
      "Log incidents, submit protests, and maintain clean racing standards.",
  },
  {
    icon: "📅",
    title: "Race Calendar",
    description:
      "Schedule races, send reminders, and track attendance across your season.",
  },
];

export default function RacingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🏎️</span>
                <span className="text-sm text-slate-300">
                  SA Sim Racing Community 🇿🇦
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Sim Racing in{" "}
                <span className="bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
                  South Africa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-8">
                Join SA&apos;s fastest-growing esports community. Compete in
                leagues, climb the rankings, and race against the best drivers
                in the country.
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

            {/* Live Race Preview */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE RACE
                    </span>
                  </div>
                  <span className="text-xs text-red-400 px-2 py-0.5 bg-red-500/10 rounded-full">
                    Lap 12/25
                  </span>
                </div>

                {/* Timing Tower */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                  <div className="text-xs text-slate-500 mb-2">GT3 Sprint Race - Kyalami</div>
                  {[
                    { pos: 1, name: "FastMarco_ZA", gap: "Leader", car: "AMG GT3" },
                    { pos: 2, name: "SpeedKing_SA", gap: "+1.234", car: "992 GT3 R" },
                    { pos: 3, name: "RaceAce_JHB", gap: "+3.567", car: "M4 GT3" },
                    { pos: 4, name: "DriftMaster", gap: "+5.891", car: "Huracan GT3" },
                  ].map((driver) => (
                    <div
                      key={driver.pos}
                      className={`flex items-center justify-between p-2 rounded-lg mb-1 ${
                        driver.pos === 1
                          ? "bg-amber-500/20 border border-amber-500/30"
                          : "bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                            driver.pos === 1
                              ? "bg-amber-500 text-black"
                              : driver.pos === 2
                              ? "bg-slate-400 text-black"
                              : driver.pos === 3
                              ? "bg-amber-700 text-white"
                              : "bg-slate-700 text-white"
                          }`}
                        >
                          {driver.pos}
                        </span>
                        <span className="text-sm text-white">{driver.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">{driver.gap}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sim Tags */}
                <div className="flex flex-wrap gap-2">
                  {sims.slice(0, 4).map((sim) => (
                    <span
                      key={sim.name}
                      className="px-2 py-1 rounded-md text-xs font-medium bg-slate-800/50 text-slate-400"
                    >
                      {sim.icon} {sim.name}
                    </span>
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
              { value: "4,800+", label: "Drivers" },
              { value: "28K+", label: "Races Completed" },
              { value: "120+", label: "Championships" },
              { value: "1.2M+", label: "Laps Driven" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-400">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Sims */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              All Your Sims, One Profile
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Track results across every sim you race. One rating, one profile,
              all platforms.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {sims.map((sim) => (
              <div
                key={sim.name}
                className="glass-card rounded-xl p-4 hover:border-red-500/30 transition-colors text-center"
              >
                <div className="text-3xl mb-2">{sim.icon}</div>
                <h3 className="font-medium text-white text-sm">{sim.name}</h3>
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
              Built for Sim Racers
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to run professional sim racing leagues.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-600/20 flex items-center justify-center text-2xl mb-4">
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
            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20 hover:border-red-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏁</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">League Organizers</h4>
                  <p className="text-xs text-red-400/80">Run championships</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Points, drops, incidents - all automated. I focus on
                racing, not spreadsheets.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎮</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Competitive Drivers</h4>
                  <p className="text-xs text-orange-400/80">Climb the ranks</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;One rating across all sims. I can see exactly where I
                stand in SA.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-rose-500/5 to-transparent border-rose-500/20 hover:border-rose-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Sim Racing Centres</h4>
                  <p className="text-xs text-rose-400/80">Host events</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Our weekly races fill up instantly. Players love the live
                timing on our screens.&quot;
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl">👀</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Racing Fans</h4>
                  <p className="text-xs text-amber-400/80">Live race tracking</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 italic">
                &quot;Watch live timing during races. See gaps, positions, and
                incidents in real-time.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to Start Your Engines?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join South Africa&apos;s sim racing community. Find leagues,
                compete in championships, and prove you&apos;re the fastest in
                SA.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
              .filter((s) => s.slug !== "racing")
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
