import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";

export default function EquipmentPage() {
  return (
    <MarketingLayout>
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="text-lg">🧰</span>
              <span className="text-sm text-slate-300">Equipment Tracking</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-6">
              Know Your <span className="text-slate-400">Gear</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400">
              Track your equipment, monitor usage, and know when it&apos;s time
              for maintenance or an upgrade.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "📦",
                title: "Gear Inventory",
                description:
                  "Catalog all your equipment with photos, specs, and purchase dates.",
              },
              {
                icon: "📈",
                title: "Usage Tracking",
                description:
                  "See how often you use each piece of gear and track performance impact.",
              },
              {
                icon: "🔔",
                title: "Maintenance Alerts",
                description:
                  "Get reminded when it's time to replace strings, tips, or perform maintenance.",
              },
              {
                icon: "💰",
                title: "Value Tracking",
                description:
                  "Track what you've invested in your hobby over time.",
              },
              {
                icon: "📊",
                title: "Performance Correlation",
                description:
                  "See how different equipment affects your stats and results.",
              },
              {
                icon: "🔄",
                title: "Upgrade History",
                description:
                  "Track your progression from beginner gear to pro equipment.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6">
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/waitlist"
              className="btn-primary px-8 py-4 rounded-full text-base"
            >
              Get Early Access
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
