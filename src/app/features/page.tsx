import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features - Tournament Tools Built for South Africa",
  description:
    "Explore our Digital Commissioner toolkit, live brackets, and smart notifications. Built for South African sports communities with local needs in mind.",
  alternates: {
    canonical: "/features",
  },
  keywords: [
    "sports app features",
    "tournament management South Africa",
    "live scoring SA",
    "sports brackets",
    "South African sports technology",
  ],
  openGraph: {
    title: "Features - Tournament Tools Built for South Africa",
    description:
      "Explore our Digital Commissioner toolkit, live brackets, and smart notifications. Built for SA sports communities.",
    url: "https://leaguesports.co.za/features",
  },
};

const features = [
  {
    category: "Digital Commissioner",
    description: "Your AI-powered tournament management assistant",
    items: [
      {
        title: "Automated Scheduling",
        description:
          "Intelligent match scheduling that considers player availability, venue capacity, and optimal timing.",
        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      },
      {
        title: "Rule Enforcement",
        description:
          "Built-in rulebook for each sport with automatic violation detection and fair play monitoring.",
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      },
      {
        title: "Dispute Resolution",
        description:
          "Streamlined process for handling match disputes with evidence submission and third-party review.",
        icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
      },
    ],
  },
  {
    category: "Live Brackets & Scoring",
    description: "Real-time tournament visualization and score tracking",
    items: [
      {
        title: "Interactive Brackets",
        description:
          "Beautiful, responsive bracket displays that update in real-time as matches progress.",
        icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
      },
      {
        title: "Live Scoring",
        description:
          "Score matches from any device with instant sync across all viewers and participants.",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      },
      {
        title: "Venue Displays",
        description:
          "Cast live brackets and leaderboards to TV screens at your venue for spectators.",
        icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      },
    ],
  },
  {
    category: "Smart Notifications",
    description: "Stay informed without being overwhelmed",
    items: [
      {
        title: "Match Reminders",
        description:
          "Get notified before your matches with opponent info and venue details.",
        icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
      },
      {
        title: "Progress Updates",
        description:
          "Weekly summaries of your performance, ranking changes, and achievement progress.",
        icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      },
      {
        title: "Community Activity",
        description:
          "Stay connected with tournament announcements, new members, and community highlights.",
        icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
      },
    ],
  },
  {
    category: "Stats & Analytics",
    description: "Deep insights into your performance",
    items: [
      {
        title: "Performance Tracking",
        description:
          "Comprehensive stats tracking tailored to each sport with trend analysis.",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      },
      {
        title: "Skill Ratings",
        description:
          "ELO-based rating system that accurately reflects your skill level and matchup quality.",
        icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
      },
      {
        title: "Achievements",
        description:
          "Unlock badges and milestones as you progress in your sporting journey.",
        icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10" />
        <div className="max-w-6xl mx-auto px-4 py-12 relative">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-400 mb-4 tracking-wider uppercase">
              Built for South African Sports 🇿🇦
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Powerful{" "}
              <span className="bg-gradient-to-r from-blue-400 to-emerald-500 bg-clip-text text-transparent">
                Features
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Everything you need to run tournaments, track progress, and build
              thriving sports communities across South Africa — all in one platform.
            </p>
          </div>
        </div>
      </section>

      {/* Features Sections */}
      {features.map((section, sectionIdx) => (
        <section
          key={section.category}
          className={`py-20 ${sectionIdx % 2 === 0 ? "bg-slate-900/50" : ""}`}
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                {section.category}
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                {section.description}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {section.items.map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card rounded-2xl p-8 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-slate-400 mb-8">
            Join thousands of South African players already using LeagueSports
            to level up their game — from Joburg to Cape Town.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/waitlist"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
