import type { Metadata } from "next";
import Link from "next/link";
import { GolfQuickStart } from "@/components/golf/GolfQuickStart";
import { isGolfVenue, toGolfVenueOption } from "@/lib/golf/venue-options";
import { getVenueBySlug, searchVenues } from "@/services/venues";

export const metadata: Metadata = {
  title: "New Golf Round | LeagueSports",
  description: "Start a live golf round with a course, tee, and 1–4 players.",
  robots: { index: false, follow: false },
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

export default async function NewGolfRoundPage({
  searchParams,
}: {
  searchParams: Promise<{ venue?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedSlug = firstParam(params.venue);

  const [golfCourses, requestedVenue] = await Promise.all([
    searchVenues({ intent: "play", sportSlug: "golf" }).then((venues) =>
      venues.map(toGolfVenueOption).filter(isGolfVenue),
    ),
    requestedSlug ? getVenueBySlug(requestedSlug) : Promise.resolve(null),
  ]);

  const requestedOption = requestedVenue
    ? toGolfVenueOption(requestedVenue)
    : null;
  const initialVenue =
    requestedOption && isGolfVenue(requestedOption) ? requestedOption : null;

  const venues = initialVenue
    ? [
        initialVenue,
        ...golfCourses.filter(
          (course) =>
            course.slug.toLowerCase() !== initialVenue.slug.toLowerCase(),
        ),
      ]
    : golfCourses;

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto grid max-w-2xl grid-cols-[1fr_auto_1fr] items-center">
          <Link
            href={initialVenue ? `/venues/${initialVenue.slug}` : "/play/golf"}
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            {initialVenue ? "← Venue" : "← Play golf"}
          </Link>
          <span className="font-display text-lg tracking-wide text-white">
            LEAGUE<span className="text-[var(--color-brand)]">SPORTS</span>
          </span>
          <Link
            href="/golf/history"
            className="justify-self-end text-sm text-zinc-400 transition-colors hover:text-white"
          >
            History
          </Link>
        </div>
      </div>
      <GolfQuickStart
        venues={venues}
        initialVenueSlug={initialVenue?.slug}
        lockVenue={Boolean(initialVenue)}
      />
    </main>
  );
}
