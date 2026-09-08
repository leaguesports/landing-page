import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLoginPageHref } from "@/lib/auth-return-to";
import { getServerAuthState } from "@/lib/server-auth";
import { isVenueClaimable } from "@/lib/venues/contact-cta";
import { canManageVenueScreenings } from "@/lib/venues/screening-editor";
import { getVenueBySlug } from "@/services/venues";
import { VenueScreeningEditor } from "./_components/VenueScreeningEditor";

type Props = {
  params: Promise<{ venue: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venue: slug } = await params;
  const venue = await getVenueBySlug(slug);
  return {
    title: venue ? `Manage screenings \u00b7 ${venue.name}` : "Manage screenings",
    robots: { index: false, follow: false },
  };
}

export default async function VenueScreeningsPage({ params }: Props) {
  const { venue: slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) return notFound();

  const auth = await getServerAuthState();
  const canManage = canManageVenueScreenings({
    claim_status: venue.claim_status,
    claimedByUserId: venue.claimedByUserId,
    sessionUserId: auth.user?.id,
  });
  const returnTo = `/venues/${venue.slug}/screenings`;
  const claimHref = `/claim?venue=${encodeURIComponent(venue.slug)}`;
  const signedIn = Boolean(auth.user?.id);

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/35 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="relative mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Venue owners
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Manage screenings
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            List upcoming broadcasts at{" "}
            <span className="font-medium text-white">{venue.name}</span>. Fans
            see them on this venue and /events after refresh.
          </p>

          <p className="mt-4">
            <Link
              href={`/venues/${venue.slug}`}
              className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Back to venue
            </Link>
          </p>

          {!canManage ? (
            <div className="mt-8 rounded-3xl border border-white/8 bg-[#141814] p-6 sm:p-8">
              <h2 className="font-display text-3xl tracking-wide text-white">
                {signedIn ? "You do not manage this listing" : "Sign in to continue"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {signedIn
                  ? "Only the claimed owner can post screenings. If this is your venue, send a claim request."
                  : "Sign in with the account that claimed this venue, then add kickoff times and fixture titles."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {!signedIn ? (
                  <Link
                    href={getLoginPageHref(returnTo)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)]"
                  >
                    Sign in
                  </Link>
                ) : null}
                {isVenueClaimable(venue) || !signedIn ? (
                  <Link
                    href={claimHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Claim this venue
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <VenueScreeningEditor
                venueSlug={venue.slug}
                venueName={venue.name}
                initialScreenings={venue.upcoming_screenings ?? []}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
