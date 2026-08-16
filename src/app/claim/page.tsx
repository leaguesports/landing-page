import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Claim your venue",
  description:
    "Claim your LeagueSports venue listing for free to update match schedules and take direct bookings.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ venue?: string }>;
};

export default async function ClaimVenuePage({ searchParams }: Props) {
  const { venue: venueSlug } = await searchParams;
  const slug = venueSlug?.trim() || "";

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/35 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="relative mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Venue owners
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Claim your profile
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Free listing control for match schedules, amenities, and WhatsApp
            bookings.
            {slug ? (
              <>
                {" "}
                You&apos;re claiming{" "}
                <span className="font-medium text-white">{slug}</span>.
              </>
            ) : null}
          </p>

          <div className="mt-8 rounded-3xl border border-white/8 bg-[#141814] p-6">
            <p className="text-sm leading-relaxed text-zinc-400">
              We&apos;ll verify ownership and unlock editing for schedules,
              screens, and contact details. Email us to get started
              {slug ? (
                <>
                  {" "}
                  — include the venue slug{" "}
                  <span className="font-medium text-white">{slug}</span>.
                </>
              ) : (
                "."
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`mailto:privacy@leaguesports.co.za?subject=${encodeURIComponent(
                  slug
                    ? `Claim venue: ${slug}`
                    : "Claim venue listing",
                )}&body=${encodeURIComponent(
                  slug
                    ? `Hi LeagueSports,\n\nI'd like to claim the venue listing for ${slug}.\n\nVenue manager name:\nPhone / WhatsApp:\n`
                    : "Hi LeagueSports,\n\nI'd like to claim my venue listing.\n\nVenue name / slug:\nVenue manager name:\nPhone / WhatsApp:\n",
                )}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)]"
              >
                Email to claim
              </a>
              {slug ? (
                <Link
                  href={`/venues/${encodeURIComponent(slug)}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white hover:text-white"
                >
                  Back to venue
                </Link>
              ) : (
                <Link
                  href="/venues"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white hover:text-white"
                >
                  Browse venues
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
