import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import type { VenueGalleryImage } from "@/lib/venues/gallery";
import {
  venueAddressLine,
  type VenueContactLink,
} from "@/lib/venues/page-template";
import {
  isRemoteVenuePhoto,
  venuePhotoUrl,
} from "@/lib/venues/photo";
import { resolveVenueImage } from "@/services/venues";
import type { VenueDetail } from "@/services/venues";
import { VenueFollowButton } from "./VenueFollowButton";
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

export type { VenueGalleryImage };

/**
 * Hero photo only. No dashed placeholder when the venue has no `hero_image`.
 * A later gallery (`VenueGalleryImage[]`, alt + credit) belongs in `after`,
 * immediately under this photo. This pass does not render that gallery.
 */
export function VenueSinglePhoto({
  venue,
  name,
  after,
}: {
  venue: Pick<VenueDetail, "hero_image">;
  name: string;
  after?: ReactNode;
}) {
  const heroOnly = { hero_image: venue.hero_image, sports: [] as VenueDetail["sports"] };
  const source = resolveVenueImage(heroOnly);
  const url = source ? venuePhotoUrl(heroOnly, { width: 1600, height: 1000 }) : null;
  const photo = url && isRemoteVenuePhoto(url) ? (
    <div className="relative -mx-4 aspect-[5/4] min-h-72 overflow-hidden sm:-mx-6 sm:aspect-[16/9] sm:min-h-[22rem]">
      <Image
        src={url}
        alt={name}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
    </div>
  ) : null;

  if (!photo && !after) return null;

  return (
    <div data-venue-hero>
      {photo}
      {after}
    </div>
  );
}

export function VenueGoodFor({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Good for">
      {labels.map((label) => (
        <li
          key={label}
          className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-zinc-200"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}

export function VenueScreensLine({ line }: { line: string | null }) {
  if (!line) return null;
  return <p className="text-sm leading-relaxed text-zinc-400">{line}</p>;
}

export function VenueContactRow({ links }: { links: VenueContactLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Contact">
      {links.map((link) => {
        const external = link.kind === "website" || link.kind === "whatsapp";
        return (
          <a
            key={link.kind}
            href={link.href}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            {link.label}
          </a>
        );
      })}
    </div>
  );
}

/** Street address only. Directions is the maps link. No embedded map. */
export function VenueLocation({
  venue,
}: {
  venue: Pick<VenueDetail, "address">;
}) {
  const line = venueAddressLine(venue.address);
  if (!line) return null;

  return (
    <section aria-labelledby="venue-location">
      <h2
        id="venue-location"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
      >
        Location
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{line}</p>
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
