"use client";

import Link from "next/link";

const activities = [
  {
    name: "Sim Golf",
    description: "Virtual fairways, real competition",
    icon: "⛳",
    gradient: "from-emerald-500 to-green-600",
    players: "12K+",
  },
  {
    name: "Padel",
    description: "Fast-paced court action",
    icon: "🎾",
    gradient: "from-amber-500 to-orange-600",
    players: "8K+",
  },
  {
    name: "Sim Racing",
    description: "High-octane virtual motorsport",
    icon: "🏎️",
    gradient: "from-red-500 to-rose-600",
    players: "25K+",
  },
  {
    name: "Esports",
    description: "Competitive gaming leagues",
    icon: "🎮",
    gradient: "from-violet-500 to-purple-600",
    players: "50K+",
  },
  {
    name: "Darts",
    description: "Precision throwing tournaments",
    icon: "🎯",
    gradient: "from-sky-500 to-blue-600",
    players: "5K+",
  },
  {
    name: "Pool",
    description: "Cue sports championships",
    icon: "🎱",
    gradient: "from-slate-500 to-gray-600",
    players: "7K+",
  },
];

const features = [
  {
    title: "30-Second Match Logging",
    description:
      "Quickplay lets you log any match in seconds. Select activity, add opponents, record score—done.",
    icon: (
      <svg
        className="w-6 h-6"
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
    ),
  },
  {
    title: "Activity-Specific Scoring",
    description:
      "Golf strokes, padel sets, racing positions—each activity has its own intuitive scoring interface.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "Personal Stats & History",
    description:
      "Track your wins, losses, improvement over time, and head-to-head records against friends.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Community Events",
    description:
      "Join or create communities to participate in organized tournaments, leagues, and recurring events.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Leaderboards & Challenges",
    description:
      "Compete on community leaderboards and take on challenges to earn achievements and bragging rights.",
    icon: (
      <svg
        className="w-6 h-6"
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
    ),
  },
  {
    title: "Works Everywhere",
    description:
      "Log matches on the go from your phone, or manage communities from desktop. Your data syncs everywhere.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

const stats = [
  { value: "500K+", label: "Matches Logged" },
  { value: "100K+", label: "Active Players" },
  { value: "5K+", label: "Communities" },
  { value: "6", label: "Activity Types" },
];

const testimonials = [
  {
    quote:
      "LeagueSports transformed how we run our sim golf league. What used to take hours now takes minutes.",
    author: "Marcus Chen",
    role: "Sim Golf League Organizer",
    avatar: "MC",
  },
  {
    quote:
      "The best platform for managing our padel club tournaments. The scheduling feature alone is worth it.",
    author: "Sofia Rodriguez",
    role: "Padel Club Manager",
    avatar: "SR",
  },
  {
    quote:
      "We've grown our sim racing community from 50 to 500 members thanks to the tools LeagueSports provides.",
    author: "James Wilson",
    role: "Racing League Admin",
    avatar: "JW",
  },
];

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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-slate-950 font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold font-heading">
                League<span className="gradient-text">Sports</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/communities"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Communities
              </Link>
              <Link
                href="#features"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="#activities"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Activities
              </Link>
              <Link
                href="#testimonials"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/quickplay"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity"
              >
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Quickplay</span>
              </Link>
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-primary px-5 py-2.5 rounded-full text-sm"
              >
                <span>Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm text-slate-300">
                Track every match • Build your stats • Compete with friends
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading leading-tight mb-6 animate-fade-in-up animation-delay-100">
              Your Sports Life,
              <br />
              <span className="gradient-text">All in One Place.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
              Log matches in seconds with Quickplay, track your personal stats,
              and join communities to compete in organized events—whether
              it&apos;s padel, sim golf, racing, or any activity you love.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
              <Link
                href="/quickplay"
                className="px-8 py-4 rounded-full text-lg w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/25"
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
                <span>Log a Match Now</span>
              </Link>
              <Link
                href="/communities"
                className="btn-secondary px-8 py-4 rounded-full text-lg w-full sm:w-auto flex items-center justify-center gap-2"
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Explore Communities
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto animate-fade-in-up animation-delay-400">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold font-heading gradient-text stat-number">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Ways to Play Section */}
      <section className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              Play Your Way
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Whether you&apos;re tracking personal matches or competing in
              organized events
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Quickplay Card */}
            <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-heading mb-3">
                  Quickplay
                </h3>
                <p className="text-slate-400 mb-6">
                  Just finished a match? Log it in seconds. Track your personal
                  stats, win rates, and progress over time—no community needed.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-slate-300">
                    <svg
                      className="w-5 h-5 text-amber-500"
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
                    Log matches in under 30 seconds
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <svg
                      className="w-5 h-5 text-amber-500"
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
                    Activity-specific scoring (strokes, sets, positions)
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <svg
                      className="w-5 h-5 text-amber-500"
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
                    Build your personal match history
                  </li>
                </ul>
                <Link
                  href="/quickplay"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <span>Try Quickplay</span>
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Communities Card */}
            <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-slate-950"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-heading mb-3">
                  Communities
                </h3>
                <p className="text-slate-400 mb-6">
                  Create or join groups of players. Organize events, run
                  tournaments, track leaderboards, and take on challenges
                  together.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-slate-300">
                    <svg
                      className="w-5 h-5 text-primary"
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
                    Organize recurring events and tournaments
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <svg
                      className="w-5 h-5 text-primary"
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
                    Live leaderboards and rankings
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <svg
                      className="w-5 h-5 text-primary"
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
                    Community challenges and achievements
                  </li>
                </ul>
                <Link
                  href="/communities"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary"
                >
                  <span>Browse Communities</span>
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              Works With{" "}
              <span className="gradient-text">Your Favorite Activities</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From virtual sports to real-world games, track matches and compete
              in the activities you love.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {activities.map((activity, idx) => (
              <div
                key={activity.name}
                className={`activity-card glass-card rounded-2xl p-6 md:p-8 cursor-pointer group ${
                  idx === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div
                  className={`activity-icon w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${activity.gradient} flex items-center justify-center text-2xl md:text-3xl mb-4`}
                >
                  {activity.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-heading mb-2 group-hover:text-primary transition-colors">
                  {activity.name}
                </h3>
                <p className="text-slate-400 text-sm md:text-base mb-4">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-primary font-semibold">
                    {activity.players}
                  </span>
                  <span className="text-slate-500">active players</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/activities"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors font-medium"
            >
              Explore all activities
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              Everything You Need to{" "}
              <span className="gradient-text-alt">Compete</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Powerful tools designed to make running competitions effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feature-card glass-card rounded-2xl p-6 md:p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mb-5">
                  {feature.icon}
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

      {/* How It Works */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              Up and Running in <span className="gradient-text">3 Steps</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Get your first tournament live in under 5 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary" />

            {[
              {
                step: "01",
                title: "Create Your Space",
                description:
                  "Set up your community in seconds. Add a name, description, and invite your first members.",
              },
              {
                step: "02",
                title: "Launch a Tournament",
                description:
                  "Choose your format, set the rules, and open registration. Our smart scheduler handles the rest.",
              },
              {
                step: "03",
                title: "Watch It Unfold",
                description:
                  "Real-time updates, automatic standings, and instant notifications keep everyone in the loop.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-primary flex items-center justify-center mx-auto mb-6 relative z-10">
                  <span className="text-xl font-bold gradient-text">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              Loved by <span className="gradient-text">Organizers</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Join thousands of community leaders who trust LeagueSports.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="glass-card rounded-2xl p-6 md:p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-slate-950">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-slate-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="glass-card rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
                Ready to Build Your Community?
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
                Join thousands of organizers running successful tournaments and
                leagues. Start free, upgrade when you need.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="btn-primary px-8 py-4 rounded-full text-lg w-full sm:w-auto"
                >
                  <span>Create Your First Tournament</span>
                </Link>
                <Link
                  href="/contact"
                  className="btn-secondary px-8 py-4 rounded-full text-lg w-full sm:w-auto"
                >
                  Talk to Sales
                </Link>
              </div>
              <p className="text-sm text-slate-500 mt-6">
                No credit card required • Free forever for small communities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <span className="text-slate-950 font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold font-heading">
                  League<span className="gradient-text">Sports</span>
                </span>
              </Link>
              <p className="text-slate-400 text-sm max-w-xs mb-4">
                The ultimate platform for creating and managing tournaments,
                leagues, and competitions for any activity.
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
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    href="/communities"
                    className="hover:text-primary transition-colors"
                  >
                    Communities
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Guides
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
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Privacy
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
