import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { QuickStartFlow } from "@/components/play/QuickStartFlow";
import { listFriends } from "@/lib/friends/friends";
import {
  emptyPreferences,
  getPreferences,
} from "@/lib/preferences/preferences";
import type { QuickStartVenue } from "@/lib/play/quick-start";
import { toVenueOption } from "@/lib/padel/venue-options";
import { getServerAuthState } from "@/lib/server-auth";
import { searchVenues } from "@/services/venues";

export const metadata: Metadata = {
  title: "Quick start | LeagueSports",
  description:
    "Use your location to find the nearest court, sport, and friends to start a live scorecard.",
  robots: { index: false, follow: false },
};

function toQuickStartVenue(
  venue: Awaited<ReturnType<typeof searchVenues>>[number],
): QuickStartVenue {
  const option = toVenueOption(venue);
  return {
    ...option,
    golfCourse: venue.golfCourse ?? null,
  };
}

export default async function QuickStartPage() {
  const cookie = (await cookies()).toString();

  const [venues, friends, preferencesResult, auth] = await Promise.all([
    searchVenues({ intent: "play" }).catch(() => []),
    listFriends({ cookie }),
    getPreferences({ cookie }),
    getServerAuthState(),
  ]);

  const preferences = preferencesResult.ok
    ? preferencesResult.preferences
    : emptyPreferences();

  const quickVenues = venues.map(toQuickStartVenue);

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Hub
          </Link>
          <Link
            href="/venues"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Venues
          </Link>
        </div>
      </div>
      <QuickStartFlow
        venues={quickVenues}
        friends={friends.friends}
        preferredSports={preferences.sports}
        activeSport={preferences.activeSport}
        isAuthenticated={Boolean(auth.user)}
        selfUserId={auth.user?.id ?? null}
      />
    </main>
  );
}
