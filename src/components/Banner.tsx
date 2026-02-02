import Link from "next/link";

export default function Banner() {
  return (
    <section className="relative border-y border-white/10 bg-gradient-to-r from-green-900/30 via-black/50 to-black/50 py-12 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-green-600/10 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/5 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          {/* Left Side - Game Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
              <span className="font-semibold text-green-300">Live Event</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              <span className="text-green-400">Springboks</span>
              <span className="mx-3 text-white">vs</span>
              <span className="text-white">All Blacks</span>
            </h2>
            <p className="mb-4 text-lg text-gray-300 sm:text-xl">
              Watch the ultimate rugby clash in America
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400 lg:justify-start">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Coming Soon</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>USA Venues</span>
              </div>
            </div>
          </div>

          {/* Right Side - CTA */}
          <div className="flex-shrink-0">
            <Link
              href="/venues?event=springboks-allblacks"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-green-500 to-green-600 px-8 py-4 text-base font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
            >
              <span className="relative z-10">View Broadcasting Venues</span>
              <svg className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}