import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { urlFor } from "@/sanity/client";
import { getVenueBySlug, resolveVenueImage } from "@/services/venues";
import { ClaimForm } from "./_components/ClaimForm";

export const metadata: Metadata = {
  title: "Claim your venue",
  description:
    "Claim your LeagueSports venue listing for free to update match schedules and take direct bookings.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ venue?: string }>;
};

function resolveThumbnail(venue: NonNullable<Awaited<ReturnType<typeof getVenueBySlug>>>) {
  const source = resolveVenueImage(venue);
  if (source) {
    return urlFor(source)?.width(640).height(360).fit("crop").url() ?? null;
  }
  return null;
}

export default async function ClaimVenuePage({ searchParams }: Props) {
  const { venue: venueSlug } = await searchParams;
  const slug = venueSlug?.trim() || "";
  const venue = slug ? await getVenueBySlug(slug) : null;
  const thumbnail = venue ? resolveThumbnail(venue) : null;

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
          </p>

          {venue ? (
            <>
              <div className="mt-8 overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt=""
                    className="h-36 w-full object-cover sm:h-40"
                  />
                ) : (
                  <div className="h-24 bg-linear-to-br from-emerald-950/50 to-[#141814] sm:h-28" />
                )}
                <div className="p-5">
                  <h2 className="font-display text-3xl tracking-wide text-white">
                    {venue.name}
                  </h2>
                  {[venue.address.suburb, venue.address.city]
                    .filter(Boolean)
                    .length > 0 ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-zinc-400">
                      <MapPin className="h-4 w-4 shrink-0 text-[var(--color-brand)]" />
                      {[venue.address.suburb, venue.address.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-6">
                <ClaimForm
                  venue={{
                    slug: venue.slug,
                    name: venue.name,
                    suburb: venue.address.suburb,
                    city: venue.address.city,
                    thumbnail,
                  }}
                />
              </div>

              <div className="mt-6">
                <Link
                  href={`/venues/${encodeURIComponent(venue.slug)}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white hover:text-white"
                >
                  Back to venue
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-3xl border border-white/8 bg-[#141814] p-6">
              <p className="text-sm leading-relaxed text-zinc-400">
                {slug ? (
                  <>
                    We couldn&apos;t find a venue for{" "}
                    <span className="font-medium text-white">{slug}</span>. Open
                    your venue page and tap{" "}
                    <span className="font-medium text-white">Claim Profile</span>
                    , or browse the directory.
                  </>
                ) : (
                  <>
                    Open a venue page and tap{" "}
                    <span className="font-medium text-white">Claim Profile</span>{" "}
                    to pre-fill this form, or browse venues to find your listing.
                  </>
                )}
              </p>
              <div className="mt-6">
                <Link
                  href="/venues"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)]"
                >
                  Browse venues
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
