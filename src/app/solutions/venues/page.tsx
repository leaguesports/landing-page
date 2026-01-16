import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Venues - Run Leagues & Engage Customers",
  description:
    "Transform your venue into a sports hub. Run weekly leagues, display live scores on TVs, and keep customers coming back. Perfect for pubs, clubs, and recreational centers.",
  keywords: [
    "pub league software",
    "venue management",
    "bar sports league",
    "live scoreboard display",
    "customer engagement",
    "recreational sports venue",
  ],
  openGraph: {
    title: "For Venues | LeagueSports",
    description:
      "Fill your venue week after week with engaging leagues and professional displays.",
  },
};

const benefits = [
  {
    icon: "📺",
    title: "Live TV Displays",
    description:
      "Cast live scores, brackets, and standings to your TVs. Create that sports bar atmosphere that keeps people watching.",
    stat: "3x longer stays",
  },
  {
    icon: "📅",
    title: "Weekly League Management",
    description:
      "Set up recurring leagues that run themselves. Automatic scheduling, standings, and playoffs.",
    stat: "5 min setup",
  },
  {
    icon: "👥",
    title: "Player Registration",
    description:
      "Players sign up through the app. No more paper lists or WhatsApp chaos.",
    stat: "Zero admin work",
  },
  {
    icon: "🏆",
    title: "Season Championships",
    description:
      "End-of-season playoffs and awards. Give regulars something to play for.",
    stat: "40% retention boost",
  },
  {
    icon: "📊",
    title: "Venue Analytics",
    description:
      "See which nights are busiest, who your regulars are, and what drives repeat visits.",
    stat: "Full insights",
  },
  {
    icon: "📱",
    title: "Player App",
    description:
      "Players check standings, upcoming matches, and stats from their phones. Keeps them engaged between visits.",
    stat: "24/7 engagement",
  },
];

const useCases = [
  {
    title: "Tuesday Night Darts",
    venue: "The Crown & Anchor",
    description:
      "Weekly league with 24 players. Live brackets on the TV above the board. Players love seeing their stats.",
    result: "Tuesday revenue up 60%",
    icon: "🎯",
  },
  {
    title: "Padel Club Championship",
    venue: "Club Deportivo Sol",
    description:
      "Monthly tournaments across 4 courts. Multi-display setup shows all matches. Spectators can follow on their phones.",
    result: "Membership inquiries +45%",
    icon: "🎾",
  },
  {
    title: "Pool League Nights",
    venue: "Corner Pocket Bar",
    description:
      "8-ball league running 3 nights a week. Players track handicaps. Bar tab specials for league members.",
    result: "Wednesday-Friday packed",
    icon: "🎱",
  },
];

export default function VenuesPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="text-lg">🏟️</span>
                <span className="text-sm text-slate-300">For Venues</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
                Fill Your Venue{" "}
                <span className="text-amber-400">Every Week</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 mb-4">
                Turn slow nights into league nights. Professional displays, zero
                admin work, and regulars who keep coming back.
              </p>
              <p className="text-base text-slate-500 mb-8">
                Whether you&apos;re running a pub darts night or managing a
                multi-court sports club, LeagueSports handles the logistics so
                you can focus on hospitality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-6 py-3 rounded-full text-base"
                >
                  Get Venue Access
                </Link>
                <Link
                  href="/product/live"
                  className="btn-secondary px-6 py-3 rounded-full text-base"
                >
                  See Live Displays
                </Link>
              </div>
            </div>

            {/* Venue Preview */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-400">
                      LIVE • 3 MATCHES
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-full">
                    Tuesday League
                  </span>
                </div>

                {/* Mini TV Display Mock */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 mb-4">
                  <div className="text-center mb-3">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Table 1 • Semi-Final
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="text-sm font-bold text-white">
                        Mike T.
                      </div>
                      <div className="text-3xl font-bold text-emerald-400 font-heading">
                        3
                      </div>
                    </div>
                    <div className="text-slate-600 text-xs">vs</div>
                    <div className="text-center flex-1">
                      <div className="text-sm font-bold text-white">
                        Sarah K.
                      </div>
                      <div className="text-3xl font-bold text-amber-400 font-heading">
                        2
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-lg font-bold text-white">24</div>
                    <div className="text-[10px] text-slate-500">Players</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-lg font-bold text-white">8</div>
                    <div className="text-[10px] text-slate-500">Weeks</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-lg font-bold text-emerald-400">£</div>
                    <div className="text-[10px] text-slate-500">Prize Pool</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Why Venues Love{" "}
              <span className="gradient-text">LeagueSports</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Professional tools that make your venue stand out
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="glass-card rounded-xl p-6 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{benefit.icon}</div>
                  <span className="text-[10px] text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-full font-medium">
                    {benefit.stat}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Venues Like Yours
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              See how other venues are using LeagueSports
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="glass-card rounded-xl p-6 relative overflow-hidden"
              >
                <div className="text-3xl mb-4">{useCase.icon}</div>
                <h3 className="font-bold text-white mb-1">{useCase.title}</h3>
                <p className="text-xs text-amber-400 mb-3">{useCase.venue}</p>
                <p className="text-sm text-slate-400 mb-4">
                  {useCase.description}
                </p>
                <div className="text-sm text-emerald-400 font-medium">
                  Result: {useCase.result}
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
            Ready to transform your venue?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Get early access to LeagueSports for venues. Priority onboarding and
            dedicated support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/waitlist"
              className="btn-primary px-8 py-4 rounded-full text-base"
            >
              Get Venue Access
            </Link>
            <Link
              href="/product/tournaments"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Learn about leagues →
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
