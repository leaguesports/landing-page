import type { Metadata } from "next";
import Link from "next/link";
import { OrganiseGameForm } from "@/components/play/OrganiseGameForm";
import { listFriends } from "@/lib/friends/friends";
import { isGolfVenue, toGolfVenueOption } from "@/lib/golf/venue-options";
import { rankVenuesByCity } from "@/lib/conversion/deep-links";
import { venueQueryKey } from "@/lib/scorecard/start-href";
import { getServerAuthState } from "@/lib/server-auth";
import { getVenueBySlug, searchVenues } from "@/services/venues";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Organise Golf Game | LeagueSports",
  description: "Pick a course and time, then invite friends to golf.",
  robots: { index: false, follow: false },
};

export default async function OrganiseGolfPage({
  searchParams,
}: {
  searchParams: Promise<{
    venue?: string | string[];
    cmsId?: string | string[];
    sport?: string | string[];
    city?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const requestedSlug = venueQueryKey(params);
  const cityPrefill = Array.isArray(params.city) ? params.city[0] : params.city;
  const cookie = (await cookies()).toString();

  const [golfCourses, requestedVenue, friends, auth] = await Promise.all([
    searchVenues({ intent: "play", sportSlug: "golf" })
      .then((venues) => venues.map(toGolfVenueOption).filter(isGolfVenue))
      .catch(() => []),
    requestedSlug
      ? getVenueBySlug(requestedSlug).catch(() => null)
      : Promise.resolve(null),
    listFriends({ cookie }),
    getServerAuthState(),
  ]);

  const requestedOption = requestedVenue
    ? toGolfVenueOption(requestedVenue)
    : null;
  const initialVenue =
    requestedOption && isGolfVenue(requestedOption) ? requestedOption : null;

  const ranked = rankVenuesByCity(golfCourses, cityPrefill);
  const venues = initialVenue
    ? [
        initialVenue,
        ...ranked.filter(
          (course) =>
            course.slug.toLowerCase() !== initialVenue.slug.toLowerCase(),
        ),
      ]
    : ranked;

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href={
              initialVenue ? `/venues/${initialVenue.slug}` : "/play/golf"
            }
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            {initialVenue ? "← Venue" : "← Play golf"}
          </Link>
          {auth.isAuthenticated ? (
            <Link
              href="/"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Hub
            </Link>
          ) : null}
        </div>
      </div>
      <OrganiseGameForm
        sport="golf"
        venues={venues}
        friends={friends.friends}
        initialVenueSlug={initialVenue?.slug}
        lockVenue={Boolean(initialVenue)}
      />
    </main>
  );
}
