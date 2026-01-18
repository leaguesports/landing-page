import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - South Africa's Sports Community Platform",
  description:
    "Learn how LeagueSports is transforming the South African sports scene with professional tracking tools. Proudly built for SA players, venues, and communities.",
  alternates: {
    canonical: "/about",
  },
  keywords: [
    "about LeagueSports",
    "South African sports platform",
    "SA sports community",
    "sports technology South Africa",
  ],
  openGraph: {
    title: "About LeagueSports - South Africa's Sports Community Platform",
    description:
      "Learn how LeagueSports is transforming the South African sports scene with professional tracking tools.",
    url: "https://leaguesports.co.za/about",
  },
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10" />
        <div className="max-w-6xl mx-auto px-4 py-12 relative">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-400 mb-4 tracking-wider uppercase">
              Proudly South African 🇿🇦
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                LeagueSports
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Built in South Africa, for South Africa. We&apos;re transforming
              the local sports scene with professional tracking tools, live
              scoring, and community-driven competition management — from
              Johannesburg to Cape Town, Durban to Pretoria.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-slate-400 mb-4">
                We believe every South African player deserves professional-grade
                tools to track their progress, compete fairly, and build lasting
                communities around the sports they love.
              </p>
              <p className="text-slate-400 mb-4">
                Whether you&apos;re playing padel in Sandton, darts at your local pub
                in Stellenbosch, or sim racing in Umhlanga — LeagueSports provides
                the infrastructure to elevate your game.
              </p>
              <p className="text-slate-400 mb-4">
                We understand the unique needs of South African sports communities.
                That&apos;s why we&apos;ve built features for load shedding resilience,
                local payment methods, and support for the sports South Africans love.
              </p>
              <p className="text-slate-400">
                From the padel boom sweeping Gauteng to cricket clubs in the Western
                Cape — we&apos;re building the ultimate platform for SA&apos;s recreational
                sports enthusiasts.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "12+", label: "Sports Supported" },
                { value: "50K+", label: "SA Players" },
                { value: "10K+", label: "Tournaments Run" },
                { value: "9", label: "Provinces Covered" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Community First",
                description:
                  "We build tools that bring players together, fostering connections and healthy competition.",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
              },
              {
                title: "Fair Play",
                description:
                  "Transparent rankings, verified results, and tools that promote integrity in competition.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              },
              {
                title: "Continuous Improvement",
                description:
                  "Data-driven insights help players track progress and identify areas for growth.",
                icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
              },
            ].map((value) => (
              <div key={value.title} className="glass-card rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={value.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Join the Community?
          </h2>
          <p className="text-slate-400 mb-8">
            Start tracking your progress, join tournaments, and connect with
            players who share your passion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/waitlist"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
            <Link
              href="/features"
              className="px-8 py-4 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
