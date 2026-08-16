import Link from "next/link";

export function VenueClaimBar({
  venueName,
  venueSlug,
}: {
  venueName: string;
  venueSlug: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/12 bg-[#141814]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">
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
  );
}
