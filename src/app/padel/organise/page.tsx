import type { Metadata } from "next";
import Link from "next/link";
import { OrganiseGameForm } from "@/components/play/OrganiseGameForm";
import { listFriends } from "@/lib/friends/friends";
import { isPadelVenue, toVenueOption } from "@/lib/padel/venue-options";
import { rankVenuesByCity } from "@/lib/conversion/deep-links";
import { venueQueryKey } from "@/lib/scorecard/start-href";
import { getServerAuthState } from "@/lib/server-auth";
import { HUB_ORGANISE_HUB_HREF } from "@/lib/sports/hub-ia";
import { getVenueBySlug, searchVenues } from "@/services/venues";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Organise Padel Game | LeagueSports",
  description: "Pick a court and time, then invite friends to padel.",
  robots: { index: false, follow: false },
};

export default async function OrganisePadelPage({
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

  const [padelCourts, requestedVenue, friends, auth] = await Promise.all([
    searchVenues({ intent: "play", sportSlug: "padel" })
      .then((venues) => venues.map(toVenueOption).filter(isPadelVenue))
      .catch(() => []),
    requestedSlug
      ? getVenueBySlug(requestedSlug).catch(() => null)
      : Promise.resolve(null),
    listFriends({ cookie }),
    getServerAuthState(),
  ]);

  const requestedOption = requestedVenue
    ? toVenueOption(requestedVenue)
    : null;
  const initialVenue =
    requestedOption && isPadelVenue(requestedOption) ? requestedOption : null;

  const rankedCourts = rankVenuesByCity(padelCourts, cityPrefill);
  const venues = initialVenue
    ? [
        initialVenue,
        ...rankedCourts.filter(
          (court) =>
            court.slug.toLowerCase() !== initialVenue.slug.toLowerCase(),
        ),
      ]
    : rankedCourts;

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href={
              initialVenue ? `/venues/${initialVenue.slug}` : HUB_ORGANISE_HUB_HREF
            }
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            {initialVenue ? "← Venue" : "← Organise"}
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
        sport="padel"
        venues={venues}
        friends={friends.friends}
        initialVenueSlug={initialVenue?.slug}
        lockVenue={Boolean(initialVenue)}
      />
    </main>
  );
}
