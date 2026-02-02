import { Venue } from "@/types/venue";

export default async function VenuesPage() {
  const venuesResponse = await fetch("http://localhost:3000/api/venues")
  const venues: Venue[] = await venuesResponse.json()

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Hero Section */}
      <section className="relative border-b border-white/10 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Golf Venues in{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Gauteng
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-400">
              {`Discover ${venues.length} golf courses across Gauteng. Find the perfect course for your next round.`}
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="sticky top-0 z-40 border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-md py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
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
                  placeholder="Search by name or location..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
              >
                <option value="all">All Types</option>
              </select>

              <select
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
              >
                <option value="all">All Holes</option>
                <option value="9">9 Holes</option>
                <option value="18">18 Holes</option>
                <option value="27">27 Holes</option>
                <option value="36">36 Holes</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {venues.length} of {venues.length} venues
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {venues.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">No courses found</h3>
              <p className="mt-2 text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {venues.map((venue, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                >
                  {/* Badge */}

                  {/* Course Name */}
                  <h3 className="mb-2 text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                    {venue.name}
                  </h3>

                  {/* Address */}
                  <div className="mb-4 flex items-start gap-2 text-sm text-gray-400">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="line-clamp-2">{venue.address}</span>
                  </div>

                  {/* Additional Info */}

                  {/* Contact Info */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    {venue.phone && (
                      <a
                        href={`tel:${venue.phone}`}
                        className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>Call</span>
                      </a>
                    )}
                    {venue.website && (
                      <a
                        href={venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
                      >
                        <span>Website</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
