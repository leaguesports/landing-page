import type { Metadata } from "next";
import Link from "next/link";
import { PadelQuickStart } from "@/components/padel/PadelQuickStart";
import { isPadelVenue, toVenueOption } from "@/lib/padel/venue-options";
import { getVenueBySlug, searchVenues } from "@/services/venues";

export const metadata: Metadata = {
  title: "New Padel Match | LeagueSports",
  description: "Start a live padel match with a court, time, and four players.",
  robots: { index: false, follow: false },
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

export default async function NewPadelMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ venue?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedSlug = firstParam(params.venue);

  const [padelCourts, requestedVenue] = await Promise.all([
    searchVenues({ intent: "play", sportSlug: "padel" }).then((venues) =>
      venues.map(toVenueOption).filter(isPadelVenue),
    ),
    requestedSlug ? getVenueBySlug(requestedSlug) : Promise.resolve(null),
  ]);

  // Same predicate as the venue-page CTA: resolve by slug, then isPadelVenue.
  // Do not require the court to appear in the sportSlug GROQ filter — name-only
  // padel tags still lock. Keep searchVenues for the unlocked picker only.
  const requestedOption = requestedVenue
    ? toVenueOption(requestedVenue)
    : null;
  const initialVenue =
    requestedOption && isPadelVenue(requestedOption) ? requestedOption : null;

  const venues = initialVenue
    ? [
        initialVenue,
        ...padelCourts.filter(
          (court) =>
            court.slug.toLowerCase() !== initialVenue.slug.toLowerCase(),
        ),
      ]
    : padelCourts;

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto grid max-w-2xl grid-cols-[1fr_auto_1fr] items-center">
          <Link
            href={initialVenue ? `/venues/${initialVenue.slug}` : "/play/padel"}
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            {initialVenue ? "← Venue" : "← Play padel"}
          </Link>
          <span className="font-display text-lg tracking-wide text-white">
            LEAGUE<span className="text-[var(--color-brand)]">SPORTS</span>
          </span>
          <Link
            href="/padel/history"
            className="justify-self-end text-sm text-zinc-400 transition-colors hover:text-white"
          >
            History
          </Link>
        </div>
      </div>
      <PadelQuickStart
        venues={venues}
        initialVenueSlug={initialVenue?.slug}
        lockVenue={Boolean(initialVenue)}
      />
    </main>
  );
}
