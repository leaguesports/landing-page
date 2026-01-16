import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations - Connect Hardware, Platforms & More",
  description:
    "Sync LeagueSports with smart dartboards, sim racing rigs, Discord, calendars, and more. Automatic score capture and seamless data flow from your existing setup.",
  keywords: [
    "sports hardware integration",
    "smart dartboard app",
    "sim racing integration",
    "Discord sports bot",
    "calendar sync sports",
    "sports API",
  ],
  openGraph: {
    title: "Integrations | LeagueSports",
    description:
      "Connect everything. Smart hardware, platforms, and tools—all synced.",
  },
};

const integrations = [
  {
    category: "Smart Hardware",
    icon: "🎯",
    description: "Connect your smart equipment for automatic scoring",
    items: [
      { name: "Connected dartboards", status: "Live" },
      { name: "Smart pool tables", status: "Coming Soon" },
      { name: "Sim racing rigs", status: "Live" },
      { name: "Golf simulators", status: "Beta" },
    ],
    gradient: "from-sky-500 to-blue-600",
  },
  {
    category: "Scoring Systems",
    icon: "📊",
    description: "Multiple ways to capture and verify scores",
    items: [
      { name: "Automatic score capture", status: "Live" },
      { name: "Manual entry backup", status: "Live" },
      { name: "Photo verification", status: "Live" },
      { name: "QR code check-in", status: "Live" },
    ],
    gradient: "from-amber-500 to-orange-600",
  },
  {
    category: "Communication",
    icon: "💬",
    description: "Keep your community in the loop",
    items: [
      { name: "Discord bot", status: "Live" },
      { name: "Slack notifications", status: "Beta" },
      { name: "Email digests", status: "Live" },
      { name: "SMS alerts", status: "Coming Soon" },
    ],
    gradient: "from-violet-500 to-purple-600",
  },
  {
    category: "Calendar Sync",
    icon: "📅",
    description: "Never miss an event or match",
    items: [
      { name: "Google Calendar", status: "Live" },
      { name: "Apple Calendar", status: "Live" },
      { name: "Outlook", status: "Live" },
      { name: "iCal export", status: "Live" },
    ],
    gradient: "from-emerald-500 to-green-600",
  },
  {
    category: "Payments",
    icon: "💳",
    description: "Handle money without the hassle",
    items: [
      { name: "Entry fee collection", status: "Beta" },
      { name: "Prize pool management", status: "Beta" },
      { name: "Stripe integration", status: "Live" },
      { name: "PayPal support", status: "Coming Soon" },
    ],
    gradient: "from-pink-500 to-rose-600",
  },
  {
    category: "Data & Export",
    icon: "📈",
    description: "Your data, your way",
    items: [
      { name: "CSV export", status: "Live" },
      { name: "API access", status: "Beta" },
      { name: "Custom reports", status: "Live" },
      { name: "Webhook support", status: "Beta" },
    ],
    gradient: "from-red-500 to-orange-600",
  },
];

const highlights = [
  {
    stat: "15+",
    label: "Hardware partners",
  },
  {
    stat: "<50ms",
    label: "Sync latency",
  },
  {
    stat: "99.9%",
    label: "API uptime",
  },
  {
    stat: "Open",
    label: "API access",
  },
];

export default function IntegrationsPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="text-lg">⚡</span>
              <span className="text-sm text-slate-300">Integrations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
              Connect <span className="text-pink-400">Everything</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400">
              Sync with your favorite hardware, scoring systems, and platforms.
              LeagueSports plays nice with your existing setup—data flows
              automatically.
            </p>
          </div>

          {/* Stats */}
          <div className="glass-card rounded-2xl p-6 max-w-3xl mx-auto mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {highlights.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary font-heading">
                    {item.stat}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.category}
                className="glass-card rounded-xl p-6 hover:border-pink-500/30 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.gradient} flex items-center justify-center text-2xl mb-4`}
                >
                  {integration.icon}
                </div>
                <h3 className="font-bold text-white mb-1">
                  {integration.category}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {integration.description}
                </p>
                <ul className="space-y-2">
                  {integration.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2 text-slate-300">
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
                        {item.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          item.status === "Live"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : item.status === "Beta"
                            ? "text-amber-400 bg-amber-500/10"
                            : "text-slate-400 bg-slate-500/10"
                        }`}
                      >
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-2xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/10 to-transparent blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-3xl mb-4">🔌</div>
                <h2 className="text-2xl font-bold font-heading mb-4">
                  Build Your Own Integration
                </h2>
                <p className="text-slate-400 mb-4">
                  Our REST API gives you full access to match data, player
                  stats, and event information. Build custom dashboards,
                  automate workflows, or create your own tools.
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/waitlist"
                    className="text-primary hover:text-primary-light text-sm font-medium"
                  >
                    Request API Access →
                  </Link>
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-400 overflow-hidden">
                <div className="text-slate-500 mb-2"># Get player stats</div>
                <div className="text-pink-400">
                  curl <span className="text-slate-300">-X GET \</span>
                </div>
                <div className="text-slate-300 ml-2">
                  &quot;api.leaguesports.co.za/v1/players/123/stats&quot;
                </div>
                <div className="text-slate-500 mt-4"># Response</div>
                <div className="text-emerald-400">
                  {`{`}
                  <br />
                  <span className="ml-2">&quot;rating&quot;: 1847,</span>
                  <br />
                  <span className="ml-2">&quot;matches&quot;: 156,</span>
                  <br />
                  <span className="ml-2">&quot;win_rate&quot;: 0.72</span>
                  <br />
                  {`}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
            Don&apos;t see what you need?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            We&apos;re always adding new integrations. Request one and
            we&apos;ll prioritize based on demand.
          </p>
          <Link
            href="/waitlist"
            className="btn-primary px-8 py-4 rounded-full text-base"
          >
            Request an Integration
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
