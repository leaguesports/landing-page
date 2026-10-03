import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import {
  venueAddressLine,
  type VenueContactLink,
} from "@/lib/venues/page-template";
import {
  isRemoteVenuePhoto,
  venuePhotoUrl,
} from "@/lib/venues/photo";
import { hasVenueCoordinates, resolveVenueImage } from "@/services/venues";
import type { VenueDetail } from "@/services/venues";
import { VenueFollowButton } from "./VenueFollowButton";
import { VenueMap } from "./VenueMap";
import Image from "next/image";
import type { ReactNode } from "react";

export function FocusedVenueShell({
  template,
  slug,
  jsonLd,
  children,
}: {
  template: "watch" | "play";
  slug: string;
  jsonLd: unknown;
  children: ReactNode;
}) {
  return (
    <div data-venue-template={template}>
      <DeepLinkLand pageType="venue" slug={slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#0c0f0c] pb-24 text-white">
        <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}

export function VenueHeading({
  name,
  place,
}: {
  name: string;
  place: string;
}) {
  return (
    <header>
      <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
        {name}
      </h1>
      {place ? <p className="mt-2 text-sm text-zinc-400">{place}</p> : null}
    </header>
  );
}

export function VenueSinglePhoto({
  venue,
  name,
}: {
  venue: Pick<VenueDetail, "hero_image" | "sports">;
  name: string;
}) {
  const source = resolveVenueImage(venue);
  const url = source ? venuePhotoUrl(venue, { width: 1200, height: 675 }) : null;
  if (!url || !isRemoteVenuePhoto(url)) {
    return (
      <div
        className="flex aspect-[16/10] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#1a1f1a] px-6 text-center text-sm text-zinc-400"
        role="img"
        aria-label="No photo of this venue yet"
      >
        No photo of this venue yet
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-[#141814]">
      <Image
        src={url}
        alt={name}
        fill
        className="object-cover"
        sizes="(min-width: 640px) 36rem, 100vw"
      />
    </div>
  );
}

export function VenueGoodFor({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  return (
    <section aria-labelledby="venue-good-for">
      <h2
        id="venue-good-for"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
      >
        Good for
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {labels.map((label) => (
          <li
            key={label}
            className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-zinc-200"
          >
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function VenueScreensLine({ line }: { line: string | null }) {
  if (!line) return null;
  return <p className="text-sm leading-relaxed text-zinc-400">{line}</p>;
}

export function VenueContactRow({ links }: { links: VenueContactLink[] }) {
  if (links.length === 0) return null;
  return (
    <section aria-labelledby="venue-contact">
      <h2
        id="venue-contact"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
      >
        Contact
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => {
          const external = link.kind === "website" || link.kind === "whatsapp";
          return (
            <li key={link.kind}>
              <a
                href={link.href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-sm font-semibold text-white hover:border-white/40"
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function VenueLocation({
  venue,
}: {
  venue: Pick<VenueDetail, "name" | "address" | "latitude" | "longitude">;
}) {
  const line = venueAddressLine(venue.address);
  const mapped = hasVenueCoordinates(venue);
  if (!line && !mapped) return null;

  return (
    <section aria-labelledby="venue-location">
      <h2
        id="venue-location"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
      >
        Location
      </h2>
      {line ? <p className="mt-2 text-sm leading-relaxed text-zinc-300">{line}</p> : null}
      {mapped ? (
        <div className="mt-4">
          <VenueMap lat={venue.latitude} lng={venue.longitude} name={venue.name} />
        </div>
      ) : null}
    </section>
  );
}

export function VenueHours({ line }: { line: string | null }) {
  if (!line) return null;
  return (
    <section aria-labelledby="venue-hours">
      <h2
        id="venue-hours"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
      >
        Hours
      </h2>
      <p className="mt-2 text-sm text-zinc-300">{line}</p>
    </section>
  );
}

export function VenueAbout({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="text-sm leading-relaxed text-zinc-300">{text}</p>;
}

export function VenueDirectionsFollow({
  venueCmsId,
  venueName,
  venueSlug,
  mapsUrl,
}: {
  venueCmsId: string;
  venueName: string;
  venueSlug: string;
  mapsUrl: string;
}) {
  return (
    <div className="grid grid-cols-2 items-start gap-3">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-brand)] px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
      >
        Directions
      </a>
      <VenueFollowButton
        venueCmsId={venueCmsId}
        venueName={venueName}
        venueSlug={venueSlug}
        className="[&_button]:w-full"
      />
    </div>
  );
}
