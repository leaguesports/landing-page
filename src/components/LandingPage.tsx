"use client";

import Link from "next/link";
import { sportsList } from "@/config/sports";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen noise">
      {/* Background effects */}
      <div className="mesh-gradient" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-slate-950 font-bold text-base sm:text-lg">
                  L
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold font-heading">
                League<span className="gradient-text">Sports</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#sports"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Sports
              </Link>
              <Link
                href="#how-it-works"
                className="text-slate-300 hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#features"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Features
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/waitlist"
                className="btn-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm"
              >
                <span className="hidden xs:inline">Join </span>Waitlist
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-44 md:pb-32">
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
              One app for all your favorite sports. Get dedicated tools for
              practice drills, friendly matches, competitive play, detailed
              stats, and vibrant communities — everything you need to improve
              and have fun.
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span>Join the Waitlist</span>
              </Link>
              <a
                href="#sports"
                className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
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
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Explore Sports
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Library Preview */}
      <section id="sports" className="py-16 sm:py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Choose Your <span className="gradient-text">Sports</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
              Pick the sports you love. Each one comes with tailored practice
              drills, match tracking, performance stats, and a community of
              fellow players.
            </p>
          </div>

          {/* Sports Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {sportsList.map((sport) => (
              <div
                key={sport.id}
                className="glass-card rounded-xl sm:rounded-2xl overflow-hidden"
                style={{ background: sport.bgPattern }}
              >
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center shadow-lg shrink-0`}
                    >
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white"
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
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white">
                        {sport.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 truncate">
                        {sport.description}
                      </p>
                    </div>
                    <div className="px-2 py-1 rounded-md bg-primary/20 text-primary text-[10px] sm:text-xs font-medium shrink-0">
                      Soon
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-slate-800/50">
                      Practice
                    </span>
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-slate-800/50">
                      Casual
                    </span>
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-slate-800/50">
                      Compete
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Coming Soon Card */}
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center sm:flex-col gap-3 sm:gap-0 sm:justify-center border-2 border-dashed border-slate-700 sm:min-h-[180px]">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-800 flex items-center justify-center sm:mb-3 shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div className="sm:text-center">
                <span className="block font-medium text-slate-400 text-sm sm:text-base sm:mb-1">
                  More Sports Coming
                </span>
                <span className="text-xs text-slate-500">
                  Snooker, Badminton, Hockey...
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Modes Section */}
      <section className="py-16 sm:py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Play Your Way
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
              Whether you want to train, have fun with friends, or compete
              seriously — there&apos;s a mode for every moment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Practice Mode */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">
                  Practice
                </h3>
                <p className="text-slate-400 mb-6">
                  Structured drills designed to improve specific skills. Track
                  your consistency, set goals, and watch yourself get better.
                </p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-500"
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
                    Sport-specific drills
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-500"
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
                    Progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-500"
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
                    Skill improvement metrics
                  </li>
                </ul>
              </div>
            </div>

            {/* Casual Mode */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">Casual</h3>
                <p className="text-slate-400 mb-6">
                  Play for fun with no pressure. Perfect for friendly matches
                  that don&apos;t affect your ranking or competitive stats.
                </p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
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
                    No ranking impact
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
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
                    Solo or with friends
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
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
                    Quick session logging
                  </li>
                </ul>
              </div>
            </div>

            {/* Competitive Mode */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-red-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-red-500/10 to-transparent blur-3xl" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">
                  Compete
                </h3>
                <p className="text-slate-400 mb-6">
                  Ranked matches that count. Climb leaderboards, earn your rank,
                  and prove you&apos;re the best among your peers.
                </p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-500"
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
                    Affects your ranking
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-500"
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
                    Global leaderboards
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-500"
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
                    Match format options
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-16 sm:py-20 md:py-32 relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Simple to <span className="gradient-text">Get Started</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
              Set up in minutes. Start tracking and improving right away.
            </p>
          </div>

          {/* Steps - Vertical on mobile, Horizontal on desktop */}
          <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-4 md:gap-8 relative">
            {/* Connection line - only on desktop */}
            <div className="hidden md:block absolute top-10 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-[2px] bg-gradient-to-r from-primary via-accent to-secondary" />

            {[
              {
                step: "1",
                title: "Sign Up Free",
                description: "Create your account in seconds",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                ),
              },
              {
                step: "2",
                title: "Pick Your Sports",
                description: "Select the sports you play",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                ),
              },
              {
                step: "3",
                title: "Start Playing",
                description: "Track matches and practice",
                icon: (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </>
                ),
              },
              {
                step: "4",
                title: "See Progress",
                description: "Watch yourself improve over time",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                ),
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="flex md:flex-col items-center md:items-center gap-4 md:gap-0 md:text-center"
              >
                {/* Step number circle */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full glass-card border-2 border-primary/50 flex items-center justify-center relative z-10">
                    <svg
                      className="w-7 h-7 md:w-8 md:h-8 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  {/* Mobile vertical line */}
                  {index < 3 && (
                    <div className="md:hidden absolute left-1/2 top-full w-[2px] h-8 bg-gradient-to-b from-primary/50 to-transparent -translate-x-1/2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 md:mt-5">
                  <div className="flex items-center gap-2 md:justify-center mb-1">
                    <span className="text-xs font-bold text-primary/70">
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-heading text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
              Everything You Need to{" "}
              <span className="gradient-text-alt">Improve</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
              Tools designed to help you track progress, stay motivated, and
              connect with others who share your passion
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "Everything in One Place",
                description:
                  "See all your sports, recent games, and progress at a glance",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                ),
              },
              {
                title: "Made for Your Sport",
                description:
                  "Golf, padel, racing — each sport works exactly how you'd expect it to",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                ),
              },
              {
                title: "Detailed Analytics",
                description:
                  "Track your improvement with charts, trends, and performance insights",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                ),
              },
              {
                title: "Achievements & Goals",
                description:
                  "Earn achievements, set weekly goals, and unlock milestones as you play",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                ),
              },
              {
                title: "Communities",
                description:
                  "Join or create groups to play with friends, run tournaments, and compete",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                ),
              },
              {
                title: "Cross-Platform",
                description:
                  "Play on any device—your data syncs seamlessly everywhere",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="feature-card glass-card rounded-2xl p-6 md:p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mb-5">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/20 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Coming Soon
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-3 sm:mb-4">
                Ready to Transform How You Play?
              </h2>
              <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-6 sm:mb-8 px-2">
                Join thousands of players who want a better way to track their
                progress and enjoy their favorite sports. Sign up for early
                access.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
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
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span>Join the Waitlist</span>
                </Link>
                <a
                  href="#sports"
                  className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg w-full sm:w-auto"
                >
                  Explore Sports
                </a>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-4 sm:mt-6">
                No spam, ever. We&apos;ll only email you about launch updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <span className="text-slate-950 font-bold text-base sm:text-lg">
                    L
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold font-heading">
                  League<span className="gradient-text">Sports</span>
                </span>
              </Link>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xs mb-3 sm:mb-4">
                Your ultimate sports companion. Track, practice, and compete
                across all your favorite activities in one place.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-slate-400 hover:text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sports</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {sportsList.map((sport) => (
                  <li key={sport.id}>{sport.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="#sports"
                    className="hover:text-primary transition-colors"
                  >
                    Browse Sports
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-primary transition-colors"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} LeagueSports. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
