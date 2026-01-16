"use client";

import Link from "next/link";
import { sportsList } from "@/config/sports";
import Navigation from "./Navigation";
import Footer from "./Footer";

const features = [
  {
    title: "Sport Dashboards",
    description: "Custom tools for every sport",
    href: "/product/dashboards",
    icon: "🎮",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    title: "Tournaments",
    description: "Run professional brackets & leagues",
    href: "/product/tournaments",
    icon: "🏆",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    title: "Stats & Progression",
    description: "Track performance & earn badges",
    href: "/product/stats",
    icon: "📊",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    title: "Live Mode",
    description: "Spectator views & jumbotron",
    href: "/product/live",
    icon: "📺",
    gradient: "from-sky-500 to-blue-600",
  },
];

const solutions = [
  {
    title: "For Players",
    description: "Track stats, find matches & improve",
    href: "/solutions/players",
    icon: "🎮",
    quote: "Finally know where I actually stand",
  },
  {
    title: "For Coaches",
    description: "Manage teams & track development",
    href: "/solutions/coaches",
    icon: "📋",
    quote: "Data-driven insights for every player",
  },
  {
    title: "For Venues",
    description: "Run leagues & engage customers",
    href: "/solutions/venues",
    icon: "🏟️",
    quote: "Tuesday nights are packed now",
  },
  {
    title: "For Referees",
    description: "Score matches & manage events",
    href: "/solutions/referees",
    icon: "🏁",
    quote: "No more paper score sheets",
  },
];

const testimonials = [
  {
    quote:
      "We went from tracking scores on a whiteboard to having a full broadcast-quality display. The regulars love it.",
    author: "Mike T.",
    role: "Pub League Organizer",
    sport: "Darts",
    avatar: "🎯",
  },
  {
    quote:
      "My 3-dart average went from 45 to 62 in three months. Seeing my stats after every session keeps me motivated.",
    author: "Sarah K.",
    role: "Amateur Player",
    sport: "Darts",
    avatar: "📈",
  },
  {
    quote:
      "Managing 40+ players across multiple courts used to be chaos. Now brackets update automatically and everyone knows where to go.",
    author: "Carlos R.",
    role: "Club Manager",
    sport: "Padel",
    avatar: "🎾",
  },
];

const useCases = [
  {
    title: "Weekly Pub League",
    description:
      "Transform your Tuesday night darts into a real competition with live standings, automatic scheduling, and TV displays.",
    icon: "🍺",
    color: "amber",
  },
  {
    title: "Club Championship",
    description:
      "Run professional-grade tournaments with check-ins, seeding, live brackets, and instant result notifications.",
    icon: "🏆",
    color: "emerald",
  },
  {
    title: "Casual Practice",
    description:
      "Track your solo practice sessions, set goals, and watch your skills improve over time with detailed analytics.",
    icon: "🎯",
    color: "sky",
  },
  {
    title: "Sim Racing League",
    description:
      "Manage multi-race seasons with automatic points calculation, driver standings, and championship tracking.",
    icon: "🏎️",
    color: "red",
  },
];

export default function LandingPageNew() {
  return (
    <div className="relative min-h-screen noise">
      {/* Background effects */}
      <div className="mesh-gradient" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 md:pt-44 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-6 sm:mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs sm:text-sm text-slate-300">
                Track, Practice, Compete — All in One Place
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-heading leading-tight mb-4 sm:mb-6 animate-fade-in-up animation-delay-100">
              Your Personal
              <br />
              <span className="gradient-text">Sports Hub.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 animate-fade-in-up animation-delay-200">
              The all-in-one platform for darts, padel, sim racing, and more.
              Track your stats, run tournaments, and build communities—whether
              you&apos;re practicing at home or competing at your local pub.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0 animate-fade-in-up animation-delay-300">
              <Link
                href="/waitlist"
                className="btn-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Get Early Access
              </Link>
              <Link
                href="/product"
                className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg w-full sm:w-auto"
              >
                See Features
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-4 animate-fade-in-up animation-delay-300">
              Free during beta • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 sm:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold font-heading mb-4">
              Stop the <span className="text-red-400">Chaos</span>, Start{" "}
              <span className="gradient-text">Winning</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              See how LeagueSports transforms the way you play
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* The Old Way */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-900/10 rounded-2xl" />
              <div className="relative glass-card rounded-2xl p-6 sm:p-8 border-red-500/20 hover:border-red-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">The Old Way</h3>
                    <p className="text-xs text-red-400/80">
                      Frustrating & time-consuming
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: "📋",
                      title: "Paper & Spreadsheets",
                      desc: "Scores lost, illegible, or forgotten",
                    },
                    {
                      icon: "❓",
                      title: "No Real Progress Tracking",
                      desc: "Guessing if you're actually improving",
                    },
                    {
                      icon: "⏰",
                      title: "Manual Bracket Management",
                      desc: "Hours drawing lines and erasing mistakes",
                    },
                    {
                      icon: "😤",
                      title: "Constant Disputes",
                      desc: '"I definitely beat you last week!"',
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-300">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* With LeagueSports */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-900/10 rounded-2xl" />
              <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/20 to-transparent rounded-2xl opacity-50" />
              <div className="relative glass-card rounded-2xl p-6 sm:p-8 border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-400"
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
                  </div>
                  <div>
                    <h3 className="font-bold text-white">With LeagueSports</h3>
                    <p className="text-xs text-emerald-400">
                      Effortless & professional
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: "📺",
                      title: "Live Digital Scoreboards",
                      desc: "Big screen displays, auto-saved to cloud",
                    },
                    {
                      icon: "📈",
                      title: "Real Performance Stats",
                      desc: "See exactly where you stand and how you're improving",
                    },
                    {
                      icon: "⚡",
                      title: "One-Click Tournaments",
                      desc: "Brackets generate automatically, update in real-time",
                    },
                    {
                      icon: "✅",
                      title: "Trusted Match History",
                      desc: "Digital records both players confirm",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Highlight badge */}
                <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/30">
                  The Better Way
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Grid */}
      <section className="py-16 sm:py-24 relative" id="sports">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="flex gap-1">
                {["🎯", "⛳", "🏎️", "🎾", "🎱"].map((emoji, i) => (
                  <span key={i} className="text-sm">
                    {emoji}
                  </span>
                ))}
              </span>
              <span className="text-sm text-slate-300">
                Multi-Sport Platform
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-4">
              One App, <span className="gradient-text">Every Sport</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto">
              Each sport gets its own custom dashboard with sport-specific
              scoring, analytics, and terminology. No generic tools—just exactly
              what you need.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {sportsList.slice(0, 8).map((sport) => (
              <div
                key={sport.id}
                className="glass-card rounded-xl p-4 sm:p-5 hover:border-slate-600 transition-all group cursor-pointer"
                style={{ background: sport.bgPattern }}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3`}
                >
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={sport.icon}
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  {sport.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 hidden sm:block">
                  {sport.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              + Golf, Tennis, Bowling, and more coming soon
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-4">
              Built for{" "}
              <span className="gradient-text">Real-World Scenarios</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto">
              From casual practice to competitive leagues, LeagueSports adapts
              to how you actually play.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className={`glass-card rounded-xl p-6 hover:border-${useCase.color}-500/30 transition-all group`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-${useCase.color}-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0`}
                  >
                    {useCase.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2 text-lg">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-16 sm:py-24 border-t border-slate-800/50"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-4">
              Powerful Features,{" "}
              <span className="gradient-text">Zero Learning Curve</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto">
              Professional-grade tools that anyone can use. No technical setup,
              no complicated menus—just start playing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="glass-card rounded-xl p-5 sm:p-6 hover:border-primary/30 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/product"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
            >
              Explore all features
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-4">
              Loved by{" "}
              <span className="gradient-text">Players & Organizers</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto">
              See what our community is saying about LeagueSports.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-4xl opacity-10">
                  &quot;
                </div>
                <div className="relative">
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {testimonial.author}
                      </div>
                      <div className="text-xs text-slate-500">
                        {testimonial.role} • {testimonial.sport}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section
        className="py-16 sm:py-24 border-t border-slate-800/50"
        id="solutions"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-4">
              Built for{" "}
              <span className="gradient-text">Everyone in the Game</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto">
              Whether you&apos;re playing, coaching, organizing, or
              officiating—we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {solutions.map((solution) => (
              <Link
                key={solution.href}
                href={solution.href}
                className="glass-card rounded-xl p-5 sm:p-6 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0">
                    {solution.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">
                      {solution.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-2">
                      {solution.description}
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      &quot;{solution.quote}&quot;
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
            >
              View all solutions
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / CTA */}
      <section className="py-16 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-8">
                {[
                  { value: "10K+", label: "Matches Tracked" },
                  { value: "500+", label: "Communities" },
                  { value: "50+", label: "Countries" },
                  { value: "4.9★", label: "User Rating" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary font-heading">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
                Ready to level up your game?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of players already using LeagueSports. Free
                during beta—be among the first to experience the future of
                recreational sports.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/waitlist"
                  className="btn-primary px-8 py-4 rounded-full text-base inline-flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Get Early Access
                </Link>
                <Link
                  href="/pricing"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  View pricing →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
