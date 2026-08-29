import {
  VenueContactActions,
  VenueUtilityBadges,
} from "@/components/VenueUtilityBadges";
import { getVenueBySlug, type VenueDetail } from "@/services/venues";
import { VenueAttendanceCounter } from "./_components/VenueAttendanceCounter";
import { VenueClaimBar } from "./_components/VenueClaimBar";
import { VenueMatchSchedule } from "./_components/VenueMatchSchedule";
import { buildVenueJsonLd } from "./_components/venueJsonLd";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import {
  Bell,
  ChevronRight,
  Flag,
  MapPin,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const venueAboutPortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-5 text-balance text-base font-medium leading-[1.75] text-zinc-300 last:mb-0 sm:text-lg">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h3 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)] first:mt-0">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-zinc-400 first:mt-0">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-[var(--color-brand)]/70 py-1 pl-5 text-base italic leading-relaxed text-zinc-400 sm:text-lg">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 space-y-4 sm:my-8">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 list-decimal space-y-3 pl-5 text-zinc-300 marker:font-semibold marker:text-[var(--color-brand)] sm:my-8 sm:pl-6">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex gap-3.5 text-base font-medium leading-[1.65] text-zinc-300 sm:text-lg">
        <span
          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand)]"
          aria-hidden
        />
        <span className="min-w-0 flex-1 [&_strong]:text-white">
          {children}
        </span>
      </li>
    ),
    number: ({ children }) => (
      <li className="text-base font-medium leading-relaxed text-zinc-300 sm:text-lg [&_strong]:text-white">
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
    link: ({ children, value }) => {
      const href =
        value && typeof value === "object" && "href" in value
          ? String((value as { href?: string }).href ?? "#")
          : "#";
      return (
        <Link
          href={href}
          className="font-semibold text-[var(--color-brand)] underline decoration-[var(--color-brand)]/35 underline-offset-[3px] transition-colors hover:text-[var(--color-brand-dim)]"
        >
          {children}
        </Link>
      );
    },
  },
} satisfies PortableTextComponents;

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "This weekend", href: "#weekend" },
  { label: "Sports", href: "#sports" },
  { label: "Amenities", href: "#amenities" },
  { label: "Location", href: "#location" },
];

type Props = { params: Promise<{ venue: string }> };

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://leaguesports.co.za";
}

function buildMapsUrl(venue: VenueDetail): string {
  const query = [
    venue.name,
    venue.address.street,
    venue.address.suburb,
    venue.address.city,
  ]
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || venue.name)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string }>;
}): Promise<Metadata> {
  const { venue: slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) return { title: "Venue Not Found" };
  const title = `${venue.name}`;
  const canonicalPath = `/venues/${venue.slug}`;
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const suburb = venue.address.suburb;
  const description = suburb
    ? `${venue.name} in ${suburb} — screens, amenities, and matchday details on LeagueSports.`
    : `${venue.name} — screens, amenities, and matchday details on LeagueSports.`;

  return {
    title,
    description,
    keywords: [
      venue.name,
      suburb,
      "Venues",
      "Sports",
      "LeagueSports",
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "LeagueSports",
      type: "website",
      locale: "en_ZA",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function Breadcrumbs({ venue }: { venue: Pick<VenueDetail, "name"> }) {
  return (
    <nav
      className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500"
      aria-label="Breadcrumb"
    >
      <Link href="/" className="transition-colors hover:text-white">
        Home
      </Link>
      <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600" />
      <Link href="/venues" className="transition-colors hover:text-white">
        Venues
      </Link>
      <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600" />
      <span className="text-zinc-400">{venue.name}</span>
    </nav>
  );
}

function SectionHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8 sm:mb-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
        {label}
      </p>
      <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      ) : null}
    </header>
  );
}

export default async function VenuePage({ params }: Props) {
  const { venue: venueSlug } = await params;
  const venue = await getVenueBySlug(venueSlug);
  if (!venue) return notFound();

  const mapsSearchUrl = buildMapsUrl(venue);
  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/venues/${venue.slug}`;
  const jsonLd = buildVenueJsonLd(venue, pageUrl);
  const suburbLine = [venue.address.suburb, venue.address.city]
    .filter(Boolean)
    .join(", ");
  const showClaimBar =
    venue.is_verified !== true &&
    venue.claim_status !== "claim_pending" &&
    venue.claim_status !== "claimed";
  const addressLine = [
    venue.address.street,
    venue.address.suburb,
    venue.address.city,
    venue.address.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        className={`min-h-screen bg-[#0c0f0c] text-white ${showClaimBar ? "pb-28" : ""}`}
      >
        <nav className="sticky top-16 z-40 border-b border-white/6 bg-[#0c0f0c]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-12 max-w-7xl items-center gap-3 overflow-x-auto px-4 scrollbar-hide sm:px-6 lg:px-8">
            <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--color-brand)] px-3.5 py-1.5 text-xs font-semibold text-zinc-950">
              Venue
            </span>
            <span className="hidden max-w-48 truncate text-sm text-zinc-400 sm:inline">
              {venue.name}
            </span>

            <div className="ml-auto flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="shrink-0 rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/6 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-950/35 via-[#0c0f0c] to-[#0c0f0c]" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-6">
              <Breadcrumbs venue={venue} />
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Venue
            </p>
            <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
              {venue.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {suburbLine ? (
                <p className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                  <MapPin className="h-4 w-4 shrink-0 text-[var(--color-brand)]" />
                  {suburbLine}
                </p>
              ) : null}
              {typeof venue.rating === "number" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-amber-300" aria-hidden />
                  {venue.rating.toFixed(1)}
                </span>
              ) : null}
            </div>

            <div className="mt-6">
              <VenueUtilityBadges venue={venue} />
            </div>

            <div className="mt-6">
              <VenueContactActions
                venue={venue}
                directionsUrl={mapsSearchUrl}
              />
            </div>
          </div>
        </section>

        {/* Weekend hub */}
        <section
          id="weekend"
          className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="This weekend"
              title="What's on"
              description="Screenings and who's heading down"
            />
            <div className="grid max-w-3xl gap-5">
              <VenueMatchSchedule screenings={venue.upcoming_screenings} />
              <VenueAttendanceCounter venueSlug={venue.slug} />
            </div>
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label="About" title={venue.name} />

            <div className="rounded-3xl border border-white/8 bg-[#141814] p-6 sm:p-8">
              <PortableText
                value={venue.description}
                components={venueAboutPortableTextComponents}
              />
            </div>
          </div>
        </section>

        {/* Sports */}
        <section
          id="sports"
          className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Sports"
              title="Sports at this venue"
              description="Watch and play what's on offer"
            />

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                  Watch
                </h3>
                {venue.broadcasts.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {venue.broadcasts.map((b) => (
                      <li
                        key={b._id}
                        className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-zinc-300"
                      >
                        {b.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Broadcast sports coming soon.
                  </p>
                )}
              </div>
              <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                  Play
                </h3>
                {venue.sports.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {venue.sports.map((s) => (
                      <li
                        key={s._id}
                        className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-zinc-300"
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Play options coming soon.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/watch"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand)] transition-colors hover:text-white"
              >
                Find places to watch <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <span className="hidden text-zinc-700 sm:inline">|</span>
              <Link
                href="/play"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand)] transition-colors hover:text-white"
              >
                Find places to play <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section
          id="amenities"
          className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Amenities"
              title="Amenities"
              description="Power, screens, and on-site facilities"
            />
            <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
              <VenueUtilityBadges venue={venue} />
            </div>
          </div>
        </section>

        {/* Location */}
        <section
          id="location"
          className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Location"
              title="Location"
              description="Area & maps"
            />

            <div className="max-w-2xl rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand)]" />
                <div>
                  <p className="font-display text-2xl leading-tight tracking-wide text-white">
                    {venue.name}
                  </p>
                  {addressLine ? (
                    <p className="mt-1 text-sm text-zinc-400">{addressLine}</p>
                  ) : null}
                </div>
              </div>
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              >
                <MapPin className="h-4 w-4" />
                Get Directions
              </a>
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="relative overflow-hidden border-t border-white/5 py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-950/25 via-[#0c0f0c] to-[#0c0f0c]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-white/8 bg-[#141814] p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Flag className="h-4 w-4 text-[var(--color-brand)]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                    Stay in the loop
                  </span>
                </div>
                <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                  More venues
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
                  Discover screenings, fan zones, and places to play near you.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3">
                <Link
                  href="/venues"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-8 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[var(--color-brand)]"
                >
                  Browse all venues
                </Link>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-8 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                >
                  <Bell className="h-4 w-4" />
                  Venue alerts
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showClaimBar ? (
        <VenueClaimBar venueName={venue.name} venueSlug={venue.slug} />
      ) : null}
    </div>
  );
}
