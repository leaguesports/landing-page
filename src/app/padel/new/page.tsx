import type { Metadata } from "next";
import Link from "next/link";
import { PadelQuickStart } from "@/components/padel/PadelQuickStart";
import type { AuthUser } from "@/lib/api-client";
import type { QuickStartInitialSelf } from "@/lib/padel/quick-start-defaults";
import { isPadelVenue, toVenueOption } from "@/lib/padel/venue-options";
import { venueQueryKey } from "@/lib/scorecard/start-href";
import { getServerAuthState } from "@/lib/server-auth";
import { getVenueBySlug, searchVenues } from "@/services/venues";

export const metadata: Metadata = {
  title: "New Padel Match | LeagueSports",
  description: "Start a live padel match with a court, time, and four players.",
  robots: { index: false, follow: false },
};

/** Serializable self for PadelQuickStart first paint (mirrors useAuth displayName). */
function toInitialSelf(user: AuthUser | null): QuickStartInitialSelf | null {
  if (!user?.id) return null;
  const displayName =
    user.displayName?.trim() ||
    user.name?.trim() ||
    (user.handle?.trim() ? `@${user.handle.trim()}` : "") ||
    user.email?.trim() ||
    "You";
  return { id: user.id, displayName };
}

export default async function NewPadelMatchPage({
  searchParams,
}: {
  searchParams: Promise<{
    venue?: string | string[];
    cmsId?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const requestedSlug = venueQueryKey(params);

  const [padelCourts, requestedVenue, auth] = await Promise.all([
    searchVenues({ intent: "play", sportSlug: "padel" }).then((venues) =>
      venues.map(toVenueOption).filter(isPadelVenue),
    ),
    requestedSlug ? getVenueBySlug(requestedSlug) : Promise.resolve(null),
    getServerAuthState(),
  ]);

  const initialSelf = toInitialSelf(auth.user);

  // Same predicate as the venue-page CTA: resolve by slug or cmsId, then isPadelVenue.
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
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href={
              initialVenue
                ? `/venues/${initialVenue.slug}`
                : "/play/padel"
            }
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            {initialVenue ? "← Venue" : "← Play padel"}
          </Link>
          <Link
            href="/padel/history"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            History
          </Link>
        </div>
      </div>
      <PadelQuickStart
        venues={venues}
        initialVenueSlug={initialVenue?.slug}
        lockVenue={Boolean(initialVenue)}
        initialSelf={initialSelf}
      />
    </main>
  );
}
