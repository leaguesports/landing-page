import Link from "next/link";

export default function Home() {
  return (
    <>
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="mr-2 h-2 w-2 rounded-full bg-green-400"></span>
            <span className="text-gray-300">Competitive Sports</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            <span className="block">Find Your</span>
            <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Next Game
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-gray-400 sm:text-2xl">
            Discover venues and events near you. Connect with players and start competing.
          </p>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div>Active Venues</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-2xl font-bold text-white">1,200+</div>
              <div>Upcoming Events</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-2xl font-bold text-white">10K+</div>
              <div>Active Players</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/venues"
              className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10">Browse Venues</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link
              href="/events"
              className="group rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
            >
              View Events
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* Search Bar Preview */}
          <div className="mt-16 mx-auto max-w-2xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-left">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search venues, events, or locations..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  readOnly
                />
                <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="h-6 w-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>

    {/* Featured Events Section */}
    <section className="relative border-t border-white/10 bg-[#0f0f0f] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Featured Events
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Don&apos;t miss out on these exciting upcoming competitions
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Event Card 1 */}
          <Link
            href="/events/1"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              {/* Event Badge */}
              <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-400"></span>
                <span>Upcoming</span>
              </div>

              {/* Event Title */}
              <h3 className="mb-2 text-xl font-bold">Weekend Darts Championship</h3>
              
              {/* Event Details */}
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Mar 15, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>The Sports Bar, Cape Town</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>24 participants</span>
                </div>
              </div>

              {/* Event Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm font-medium text-white">Free Entry</span>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  View Details →
                </span>
              </div>
            </div>
          </Link>

          {/* Event Card 2 */}
          <Link
            href="/events/2"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-400"></span>
                <span>Upcoming</span>
              </div>
              <h3 className="mb-2 text-xl font-bold">Padel Open Tournament</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Mar 22, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Padel Club, Johannesburg</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>16 teams</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm font-medium text-white">R150 Entry</span>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  View Details →
                </span>
              </div>
            </div>
          </Link>

          {/* Event Card 3 */}
          <Link
            href="/events/3"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-400"></span>
                <span>Upcoming</span>
              </div>
              <h3 className="mb-2 text-xl font-bold">Sim Racing Championship</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Apr 5, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Racing Hub, Durban</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>32 racers</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm font-medium text-white">R200 Entry</span>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
          >
            View All Events
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>

    {/* Featured Venues Section */}
    <section className="relative border-t border-white/10 bg-[#0f0f0f] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Featured Venues
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Discover the best places to play and compete
          </p>
        </div>

        {/* Venues Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Venue Card 1 */}
          <Link
            href="/venues/1"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              {/* Venue Badge */}
              <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-400"></span>
                <span>Open Now</span>
              </div>

              {/* Venue Title */}
              <h3 className="mb-2 text-xl font-bold">The Sports Bar</h3>
              
              {/* Venue Details */}
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Cape Town, Western Cape</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Darts, Pool, Snooker</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mon-Sun: 10:00 - 22:00</span>
                </div>
              </div>

              {/* Venue Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-white">4.8</span>
                  <span className="text-xs text-gray-400">(124)</span>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  View Details →
                </span>
              </div>
            </div>
          </Link>

          {/* Venue Card 2 */}
          <Link
            href="/venues/2"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-400"></span>
                <span>Open Now</span>
              </div>
              <h3 className="mb-2 text-xl font-bold">Padel Club</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Johannesburg, Gauteng</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Padel, Tennis</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mon-Sun: 07:00 - 21:00</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-white">4.9</span>
                  <span className="text-xs text-gray-400">(89)</span>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  View Details →
                </span>
              </div>
            </div>
          </Link>

          {/* Venue Card 3 */}
          <Link
            href="/venues/3"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-400"></span>
                <span>Open Now</span>
              </div>
              <h3 className="mb-2 text-xl font-bold">Racing Hub</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Durban, KwaZulu-Natal</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Sim Racing, Esports</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mon-Sun: 12:00 - 00:00</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-white">4.7</span>
                  <span className="text-xs text-gray-400">(203)</span>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
          >
            View All Venues
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>

    {/* Why Sign Up Section */}
    <section className="relative border-t border-white/10 bg-[#0f0f0f] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Why Join LeagueSports?
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Everything you need to elevate your game, all in one place
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1: Player Profile */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold">Your Player Profile</h3>
            <p className="text-sm text-gray-400">
              Create a personalized profile showcasing your sports interests, achievements, and playing style.
            </p>
          </div>

          {/* Feature 2: Digital Scorecards */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold">Digital Scorecards</h3>
            <p className="text-sm text-gray-400">
              Track every game with our digital scorecards. Never lose a score again.
            </p>
          </div>

          {/* Feature 3: Progress Tracking */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold">Track Your Progress</h3>
            <p className="text-sm text-gray-400">
              Watch your skills improve over time with detailed analytics and performance insights.
            </p>
          </div>

          {/* Feature 4: Custom Training */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold">Custom Training Drills</h3>
            <p className="text-sm text-gray-400">
              Design and follow personalized training routines tailored to your goals.
            </p>
          </div>

          {/* Feature 5: Badges */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold">Earn Badges</h3>
            <p className="text-sm text-gray-400">
              Unlock achievements and badges as you reach milestones and improve your game.
            </p>
          </div>

          {/* Feature 6: Share Results */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold">Share Your Wins</h3>
            <p className="text-sm text-gray-400">
              Celebrate your victories and share results with friends and the community.
            </p>
          </div>

          {/* Feature 7: Communities */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold">Join Communities</h3>
            <p className="text-sm text-gray-400">
              Connect with like-minded players, join local clubs, and build your network.
            </p>
          </div>

          {/* Feature 8: Integrations */}
          <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold">Smart Integrations</h3>
            <p className="text-sm text-gray-400">
              Seamlessly connect with Trackman, Autodarts, and other systems for automatic data sync.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-2xl">
            <h3 className="text-3xl font-bold">Ready to Elevate Your Game?</h3>
            <p className="mt-4 text-lg text-gray-400">
              Join thousands of players already tracking their progress, earning badges, and connecting with communities.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/signup"
                className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link
                href="/features"
                className="group rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
              >
                Learn More
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
