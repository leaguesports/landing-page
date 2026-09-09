import { GolfTourHub } from "@/components/golf-tours/GolfTourHub";
import { listFriends } from "@/lib/friends/friends";
import {
  GOLF_TOURS_HREF,
  getGolfTour,
  getGolfTourLeaderboard,
} from "@/lib/golf-tours/golf-tours";
import {
  isGolfVenue,
  toGolfVenueOption,
  type GolfVenueOption,
} from "@/lib/golf/venue-options";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type GolfTourPageProps = {
  params: Promise<{ id: string }>;
};

async function loadGolfVenues(): Promise<GolfVenueOption[]> {
  try {
    const { searchVenues } = await import("@/services/venues");
    const venues = await searchVenues({ intent: "play", sportSlug: "golf" });
    return venues.map(toGolfVenueOption).filter(isGolfVenue);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: GolfTourPageProps): Promise<Metadata> {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const tour = await getGolfTour(id, { cookie });
  if (!tour) {
    return { title: "Golf tour" };
  }
  return {
    title: tour.name,
    robots: { index: false, follow: false },
  };
}

export default async function GolfTourPage({ params }: GolfTourPageProps) {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const tour = await getGolfTour(id, { cookie });

  if (!tour) {
    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Golf tours
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
            Tour not found
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            This tour may be private, or you need to be the host or a seated
            player to view it.
          </p>
          <Link
            href={GOLF_TOURS_HREF}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Back to golf tours
          </Link>
        </div>
      </div>
    );
  }

  const [friends, golfCourses, leaderboard] = await Promise.all([
    listFriends({ cookie }),
    loadGolfVenues(),
    getGolfTourLeaderboard(id, { cookie }),
  ]);

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto min-w-0 max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href={GOLF_TOURS_HREF}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Golf tours
        </Link>
        <div className="mt-6 min-w-0">
          <GolfTourHub
            tour={tour}
            venues={golfCourses}
            friends={friends.friends}
            initialLeaderboard={leaderboard}
          />
        </div>
      </div>
    </div>
  );
}
