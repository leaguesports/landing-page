import Link from "next/link";

export function VenueClaimBar({
  venueName,
  venueSlug,
}: {
  venueName: string;
  venueSlug: string;
}) {
  return (
    <section aria-label="Claim this venue" className="border-t border-zinc-200 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-950">
            Do you manage {venueName}?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400 sm:text-sm">
            Claim this listing for free to update match schedules and take
            direct bookings.
          </p>
        </div>
        <Link
          href={`/claim?venue=${encodeURIComponent(venueSlug)}`}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)]"
        >
          Claim Profile
        </Link>
        </div>
      </div>
    </section>
  );
}
